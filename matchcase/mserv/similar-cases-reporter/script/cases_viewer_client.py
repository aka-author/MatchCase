#encoding: utf-8

# Cases Viewer
# Client library


import requests

def fetch_cases(viewer_url: str) -> list:
    
    return requests.post(viewer_url).json()["cases"]
