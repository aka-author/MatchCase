#encoding: utf-8

# Directory Viewer
# Client library


import requests

def assemble_directory_request_body(directory_code: str, lang_code: str) -> dict:

    request_body = {
        "directory_code": directory_code,
        "lang_code": lang_code
    }

    return request_body
    


def fetch_countries(viewer_url: str, lang_code: str="en") -> list:
    
    request_body = assemble_directory_request_body(
        "countries", 
        lang_code
    )

    tmp = requests.post(viewer_url, json=request_body)

    countries = tmp.json()["directory"]["countries"]

    return countries
