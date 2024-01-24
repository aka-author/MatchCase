#!C:/Program Files/Python37/python
#encoding: utf-8

## Directory Viewer
## CGI-script


import os
import sys
import pathlib
import configparser
import json
from google_sheets_viewer_client import fetch_sheet_as_record_list


def get_config(sect_name: str, key_name: str) -> configparser.ConfigParser:

    script_path = str(pathlib.Path(__file__).parent.absolute())
    config_file_path = os.path.abspath(script_path + "/config.ini")

    parser = configparser.ConfigParser()
    parser.read(config_file_path)

    return parser.get(sect_name, key_name)


def parse_directory_request(http_request_body: str) -> dict:

    """
    directory_request = {
        "directory_code": "specializations",
        "lang_code": "ru"
    }
    """
    
    request_data = json.loads(http_request_body)

    directory_request = {
        "directory_code": request_data.get("directory_code"),
        "lang_code": request_data.get("lang_code")
    }
    
    return directory_request


def fetch_directory_sheet(directory_sheet_name: str) -> list:
    
    viewer_url = get_config("MICROSERVICES", "google-sheets-viewer")
    google_doc_id =  get_config("DATABASES", "directories_google_sheets_id")

    return fetch_sheet_as_record_list(viewer_url, google_doc_id, directory_sheet_name)


def fetch_countries(lang_code: str) -> dict:

    directory = {
        "lang_code": lang_code,
        "countries": []
    }

    countries = fetch_directory_sheet(get_config("DATABASES", "countrues_sheet_name"))
    
    directory["countries"] = [{
            "country_code2": country.get("country_code2"),
            "country_name": country.get(lang_code) 
        } for country in countries]

    return directory


def fetch_industries(lang_code: str) -> dict:

    directory = {
        "lang_code": lang_code,
        "industries": []
    }

    industries = fetch_directory_sheet(get_config("DATABASES", "industries_sheet_name"))
    
    directory["industries"] = [{
            "industry_code": industry.get("industry_code"),
            "industry_name": industry.get(lang_code) 
        } for industry in industries]

    return directory


def fetch_specializations(lang_code: str) -> dict:

    directory = {
        "lang_code": lang_code,
        "specializations": []
    }
    
    specializations = fetch_directory_sheet(get_config("DATABASES", "specializations_sheet_name"))

    directory["specializations"] = [{
            "specialization_code": specialization.get("specialization_code"),
            "industry_code": specialization.get("industry_code"),
            "specialization_name": specialization.get(lang_code) 
        } for specialization in specializations]

    return directory


def fetch_directory(directory_code: str, lang_code: str) -> dict:

    directory = {}

    if directory_code == "countries":
        directory = fetch_countries(lang_code)
    elif directory_code == "industries":
        directory = fetch_industries(lang_code)
    elif directory_code == "specializations":
        directory = fetch_specializations(lang_code)
    
    return directory


def serialize_report(directory: dict) -> str:

    serialized_directory = json.dumps(directory)

    return serialized_directory


def process_request(): 

    http_request_body = sys.stdin.read(int(os.environ.get("CONTENT_LENGTH", "0")))

    directory_request = parse_directory_request(http_request_body)
    directory_code = directory_request.get("directory_code")
    lang_code = directory_request.get("lang_code")

    directory = fetch_directory(directory_code, lang_code)

    response_body = {
            "status_code": 0,
            "directory": directory
        }
    
    print("Content-type: application/json")
    print("\n")
    print(serialize_report(response_body))


process_request()
