#!python3
#encoding: utf-8

# System:   Consulting Company Website
# Module:   MatchCase
# Block:    Microservice google-sheets-viewer
# File:     CGI-script


import os
import sys
import json
import gglsheets


def parse_google_sheets_request(http_request_body: str) -> dict:
    
    """
    google_sheets_request = {
        "google_doc_id": "1ineG3uibqIqbIphEGH7YwnEKAFkfnWyGefJM6m4sMHk",
        "sheet_specs": [
            {
                "sheet_name": "Countries", 
                "format_code": "record_list"
            }
        ]
    }
    """
    
    request_data = json.loads(http_request_body)

    google_sheets_request = {
        "google_doc_id": request_data.get("google_doc_id"),
        "sheet_specs": request_data.get("sheet_specs")
    }
     
    return google_sheets_request


def assemble_google_doc_url(google_doc_id: str) -> str:

    return "https://docs.google.com/spreadsheets/d/" + google_doc_id


def fetch_google_sheet_as_record_list(google_doc_id: str, sheet_name: str) -> list:

    record_list = {
        "sheet_name": sheet_name,
        "list": []
    }

    google_sheets_uri = assemble_google_doc_url(google_doc_id)
    google_sheets = gglsheets.GoogleSheetsDoc(google_sheets_uri).add_sheet(sheet_name)
    sheet_data = google_sheets.get_sheet(sheet_name).fetch()

    if sheet_data.is_available():
        record_list = sheet_data.extract_record_list()

    return record_list


def fetch_google_sheets(google_doc_id: str, sheet_specs: str) -> dict:

    sheets = {}

    for sheet_spec in sheet_specs:

        if(sheet_spec.get("format_code") == "record_list"):
            sheet_name = sheet_spec.get("sheet_name")
            sheet = fetch_google_sheet_as_record_list(google_doc_id, sheet_name)

        sheets[sheet_spec.get("sheet_name")] = sheet
    
    return sheets


def serialize_report(directory: dict) -> str:

    serialized_directory = json.dumps(directory)

    return serialized_directory


def process_request(): 

    http_request_body = sys.stdin.read(int(os.environ.get("CONTENT_LENGTH", "0")))

    google_sheets_request = parse_google_sheets_request(http_request_body)
    google_doc_id = google_sheets_request.get("google_doc_id")
    sheet_specs = google_sheets_request.get("sheet_specs")

    sheets = fetch_google_sheets(google_doc_id, sheet_specs)

    response_body = {
            "status_code": 0,
            "sheets": sheets
        }
    
    print("Content-type: application/json")
    print("\n")
    print(serialize_report(response_body))


process_request()
