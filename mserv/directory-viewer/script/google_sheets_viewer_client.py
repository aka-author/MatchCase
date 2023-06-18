#encoding: utf-8

# Google Sheets Viewer
# Client library


import requests


def fetch_sheet(viewer_url: str, google_doc_id: str, sheet_name: str, out_format_code: str) -> any:
    
    sheet_request = {
        "google_doc_id": google_doc_id,
        "sheet_specs": [
            {
                "sheet_name": sheet_name, 
                "format_code": out_format_code
            }
        ]
    }
        
    return requests.post(viewer_url, json=sheet_request).json()["sheets"][sheet_name]


def fetch_sheet_as_record_list(viewer_url: str, google_doc_id: str, sheet_name: str) -> list:
   
    return fetch_sheet(viewer_url, google_doc_id, sheet_name, "record_list")


def fetch_sheet_as_matrix_dict(viewer_url: str, google_doc_id: str, sheet_name: str) -> dict:
    
    return fetch_sheet(viewer_url, google_doc_id, sheet_name, "matrix_dict")
