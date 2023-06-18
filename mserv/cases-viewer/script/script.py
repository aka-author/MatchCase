#!C:/Program Files/Python37/python
#encoding: utf-8

# Cases Viewer
# CGI-script


import os
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


def fetch_cases() -> list: 

    viewer_url = get_config("MICROSERVICES", "google-sheets-viewer")
    google_doc_id =  get_config("DATABASES", "cases_google_sheets_id")
    sheet_name = get_config("DATABASES", "cases_sheet_name")

    return fetch_sheet_as_record_list(viewer_url, google_doc_id, sheet_name)


def serialize_report(directory: dict) -> str:

    serialized_directory = json.dumps(directory)

    return serialized_directory


def process_request(): 

    cases = fetch_cases()

    response_body = {
            "status_code": 0,
            "cases": cases
        }
    
    print("Content-type: application/json")
    print("\n")
    print(serialize_report(response_body))


process_request()
