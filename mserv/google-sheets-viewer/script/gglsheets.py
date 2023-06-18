# This module performs the following tasks:
# - Fetching a spreadsheet from Google Docs
# - Extracting a rectangle table from a spreadsheet
#   - as a direct dump
#   - as a list of dictionaries based on column headers
#   - as a dictionary of dictionaries, where the outer
#     dictionary is based on row headers, and nested 
#     dictionaries are based on column headers


# An object of class Sheet represents a singular spreadsheet. Each objects 
# of class Sheet belongs to one object of class GoogleSheetsDoc.

import json, time
import urllib.request


class GSError(Exception):
    pass


class Sheet: 

    def __init__(self, url: str, sheet_name: str=None):

        # sheet_name--a name of a spreadsheet in a Google Sheets document.
        # If sheet_name is None, then this sheet is a default sheet
        # in a document. From the perspective of a Google Sheet document,
        # a default sheet is the first spreadsheet in a document.
        # 
        # A sheet than has a None name is treated as the first spreadsheet
        # in a Google Sheets document.
        self.__url = url
        self.__name = sheet_name
        self.sheet_dump = []
        self.fetch_status = True


    @property
    def name(self):
        return self.__name

    @name.setter
    def name(self, name):
        self.__name = name

    @property
    def url(self):
        return self.__url


    def __str__(self):
        return self.__name

    def get_url(self):
        url = self.__url + '/gviz/tq?tqx=out:json'
        if self.__name:
            url += '&sheet=' + self.__name
        return url

    def fetch(self, max_attempts: int=3, max_attempt_delay_sec: int=5) -> object:

        # Loads a sheet from Google Docs.

        # Sends a request to the Google Docs REST API. Uses an URL
        # that is assigned to a parent GoogleSheetsDoc (see below).
        # Receives a text file that represents a sheet sheet_name (or
        # the first sheet if sheet_name is None).
        # Extracts a JSON text from the file and parses it.
        _url = self.get_url()
        attempt = 1
        while True:
            #print('Load sheet. Attempt ' + str(attempt))
            try:
                gfile = urllib.request.urlopen(_url, timeout=10).read().decode('utf8')
                break
            except:
                time.sleep(max_attempt_delay_sec)
                attempt+=1

            if attempt-1 >= max_attempts:
                self.fetch_status = False
                break

        if self.fetch_status:
            gjson = gfile[gfile.find("{"):gfile.rfind("}") + 1]
            json_obj = json.loads(gjson)

            self.sheet_dump.clear()
            #"cols" branch
            row_list = []
            for cell in json_obj['table']['cols']:
                if type(cell) is dict:
                    row_list.append(cell['label'])
                else:
                    row_list.append('')
            self.sheet_dump.append(row_list)
            # "rows" branch
            for row in json_obj['table']['rows']:
                row_list = []
                for cell in row['c']:
                    if type(cell) is dict:
                        row_list.append(cell['v'])
                    else:
                        row_list.append('')
                self.sheet_dump.append(row_list)

            if self.__name == None:
                self.__name = 'Sheet' + json_obj['sig']

        return self

    def is_available(self) -> bool:
        """
        Returns True if a sheet has been fetched successfully,
        otherwise it gives False.
        """

        return self.fetch_status

    def dump(self) -> list:

        # Extracts a sheet as is: row by row, column by column.
        # An outcome is a list of lists.

        return self.sheet_dump

    def is_empty_row(self, row) -> bool:
        # Detects empty rows (for list or dictionary).

        # row--a dictionary that represents a row, e.g.
        #   {"Country": "Russia", "Capital": "Moscow", "Region": "Europe", "Block": "ODKB"}
        #
        # A cell that has an empty value or consists of space characters only
        # (white space, tab, LF, CR) shall be recognized as empty.

        if isinstance(row, dict):
            r = list(row.values())
        elif isinstance(row,list):
            r = row
        else:
            raise GSError("Error: Only list or dict type allowed!")

        is_empty = True
        for c in self.clear_row(r):
            if c != '':
                is_empty = False
                break
        return is_empty

    def contains_merged_cells(self, row: list, next_row: list) -> bool:
        
        cont_merged = False
        if len(row) != len(next_row):
            cont_merged = True
        return cont_merged

    def clear_row(self, row: list):
        cleared_row = []
        for s in row:
            if type(s) == str:
                s = ' '.join(s.split())
            cleared_row.append(s)
        return cleared_row

    def extract_record_list(self, col_headers: int=None) -> list:

        # Extracts a sheet as a list of dictionaries. 
        #
        # col_headers--a row containing column headers. If col_headers is None,
        #   then we take the first non-empty row that has no merged cells.
        #
        # Column headers shall be trimmed: 
        # - Each tab, LF, CR character shall be replaced with a white space 
        # - Then leading and trailing white spaces shall be removed
        # - Then multiple white spaces shall be replaced with a single white space
        #
        # A row that gives is_empty_row(row) == True shall be ignored. 
        #
        # A column that has an empty header shall be ignored.
        #
        #
        # Examlpe
        #
        # Input:
        #
        #   | A       | B          | C             | D 
        # ==+=========+============+===============+========
        # 1 |     Main Info        |            Details           
        # 2 | Country | Capital    | Region        | Block
        # 3 |         |            |               |
        # 4 | Russia  | Moscow     | Europe        | ODKB
        # 5 | Israel  | Jerusalem  | Asia          |  
        # 6 | USA     | Washington | North America | NATO
        #
        #
        # Call:
        # 
        # reclist = extract_record_list(2)
        #
        #
        # Output:
        #
        # [
        #  {"Country": "Russia", "Capital": "Moscow",     "Region": "Europe",     "Block": "ODKB"},
        #  {"Country": "Israel", "Capital": "Jerusalem",  "Region": "Asia",       "Block": None},   
        #  {"Country": "USA",    "Capital": "Washington", "Region": "N. America", "Block": "NATO"}
        # ]

        record_list = []

        if not self.is_available():
            return record_list

        # Header
        if col_headers:
            header = self.sheet_dump[col_headers]
            ch=col_headers
        else:
            for indx, sheet_row in enumerate(self.sheet_dump):
                r = self.clear_row(sheet_row)
                if not self.is_empty_row(r) and not self.contains_merged_cells(r, self.sheet_dump[indx+1]):
                    header = r
                    ch = indx
                    break

        #Body
        for sheet_row in self.sheet_dump[ch+1:]:
            record_list.append(dict())
            r = self.clear_row(sheet_row)
            if not self.is_empty_row(r):
                for hindx, hc in enumerate(header):
                    if hc != '':
                        record_list[-1][hc] = r[hindx]

        return record_list

    def extract_matrix_dict(self, col_headers: int=None, row_headers: str=None) -> dict:

        # Extracts a sheet as a dictionary of dictionaries. 
        #
        # col_headers--a row containing column headers. If col_headers is None,
        #   then we take the first non-empty row that has no merged cells.
        #
        # row_headers--a header of a column that contains row headers.
        #   If row_headers is None, then we take the column A by default.
        #
        # Column headers shall be trimmed (see above). 
        #
        # A row that gives is_empty_row(row) == True shall be ignored. 
        #
        # A column that has an empty header shall be ignored. 
        #
        # If row_headers is None, then the most left column that has an empty
        # header provides row headers.
        #
        # If a few rows share the same header, then we take the last one 
        # and ignore all the previous.
        # 
        # 
        # Example 1
        #
        # Input:
        # 
        #   | A       | B          | C             | D 
        # ==+=========+============+===============+========
        # 1 |     Main Info        |            Details           
        # 2 | Country | Capital    | Region        | Block
        # 3 |         |            |               | 
        # 4 | Russia  | Moscow     | Europe        | ODKB
        # 5 | Israel  | Jerusalem  | Asia          |  
        # 6 | USA     | Washington | North America | NATO
        #
        #
        # Call:
        #
        # matrix_dict = extract_matrix_dict(colheaders_row: 2, rowheaders_colheader: "Country")
        #
        #
        # Output :
        #
        # {
        #  "Russia": {"Country": "Russia", "Capital": "Moscow",     "Region": "Europe",     "Block": "ODKB"},
        #  "Israel": {"Country": "Israel", "Capital": "Jerusalem",  "Region": "Asia",       "Block": None},   
        #  "USA":    {"Country": "USA",    "Capital": "Washington", "Region": "N. America", "Block": "NATO"}
        # }
        #
        #
        # Example 2
        #
        # Input:
        # 
        #   | A       | B          | C             | D 
        # ==+=========+============+===============+========
        # 1 |         | Capital    | Region        | Block
        # 2 | Russia  | Moscow     | Europe        | ODKB
        # 3 | Israel  | Jerusalem  | Asia          |  
        # 4 | USA     | Washington | North America | NATO
        #
        #
        # Call:
        #
        # matrix_dict = extract_matrix_dict()
        #
        #
        # Output :
        #
        # {
        #  "Russia": {"Capital": "Moscow",     "Region": "Europe",     "Block": "ODKB"},
        #  "Israel": {"Capital": "Jerusalem",  "Region": "Asia",       "Block": None},   
        #  "USA":    {"Capital": "Washington", "Region": "N. America", "Block": "NATO"}
        # }
        #

        matrix_dict = dict()

        # Header
        if col_headers:
            header = self.sheet_dump[col_headers]
            ch = col_headers
        else:
            for indx, sheet_row in enumerate(self.sheet_dump):
                r = self.clear_row(sheet_row)
                if not self.is_empty_row(r) and not self.contains_merged_cells(r, self.sheet_dump[indx+1]):
                    header = r
                    ch = indx
                    break

        row_headers_ind = 0
        if row_headers != None:
            for hindx, hc in enumerate(header):
                if hc == row_headers:
                    row_headers_ind = hindx
            #Не нашли значение в хедере, значит берем первую колонку

        # Body
        for sheet_row in self.sheet_dump[ch + 1:]:
            r = self.clear_row(sheet_row)
            if not self.is_empty_row(r):
                matrix_dict[r[row_headers_ind]] = dict()
                for hindx, hc in enumerate(header):
                    if hc != '':
                        matrix_dict[r[row_headers_ind]][hc] = r[hindx]

        return matrix_dict


class GoogleSheetsDoc:

    def __init__(self, url: str=None):

        # url--an URL of a Google Sheets document.
        self.__url = url
        self.__max_attempts = 3
        self.__max_attempt_delay_sec = 5
        self.sheets = []
        self.done = False

    @property
    def url(self):
        return self.__url

    @url.setter
    def url(self, url):
        self.__url = url

    def set_fetch_options (self, max_attempts: int, max_attempt_delay_sec: int):

        self.__max_attempts = max_attempts
        self.__max_attempt_delay_sec = max_attempt_delay_sec

    def new_sheet(self, sheet_name: str=None) -> object:

        # Creates a new sheet and returns it.
        #
        # sheet_name--a name of a new list. If sheet_name is None,
        #   then the new sheet is allowed to be a default sheet only. 
        #
        # Note: We are going to overload this method in subclasses.

        sheet = Sheet(self.__url, sheet_name)

        return sheet

    def add_sheet(self, sheet_name: str=None) -> object:

        # Creates a new sheet with a passed name. 
        # Appends the new sheet to a document. 
        #
        # sheet_name--a name of a new sheet. If sheet_name is None,
        #   then the new sheet is allowed to be a default sheet only.
        #
        # A document is not allowed to have two or more defult sheets. 

        self.sheets.append(self.new_sheet(sheet_name))
        
        return self

    def count_sheets(self) -> int:

        # Returns a number of sheets in a document.
        num_sheets = len(self.sheets)

        return num_sheets

    def get_sheet_names(self) -> list:
        # Returns a list of sheet names.

        sheet_name = []

        for sh in self.sheets:
            sheet_name.append(sh.name)

        return sheet_name

    def get_sheet(self, sheet_name: str=None) -> object:

        # Returns a sheet with a passed name.
        #
        # sheet_name--a name of a required sheet.
        #
        # If the sheet_name is None then we return the default sheet.
        # If no default sheet is available, then the method returns None. 

        if self.count_sheets()==0:
            raise GSError("Error: The object does not contain any sheets!")

        sheet = self.sheets[0]

        if sheet_name != None:
            for sh in self.sheets:
                if sh.name == sheet_name:
                    sheet = sh
        return sheet
