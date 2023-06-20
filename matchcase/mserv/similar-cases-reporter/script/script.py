#!C:/Program Files/Python37/python
#encoding: utf-8

# Similar Cases Viewer
# CGI-script


import os
import sys
import pathlib
import configparser
import json
from cases_viewer_client import fetch_cases


def get_config(sect_name: str, key_name: str) -> configparser.ConfigParser:

    script_path = str(pathlib.Path(__file__).parent.absolute())
    config_file_path = os.path.abspath(script_path + "/config.ini")

    parser = configparser.ConfigParser()
    parser.read(config_file_path)

    return parser.get(sect_name, key_name)


def safe_int(input_string: any) -> int:

    return int(input_string) if input_string is not None else 0


def safe_float(input_string: any) -> float:

    return float(input_string) if input_string is not None else 0


def parse_company_params(http_request_body: str) -> dict:

    """
    request_data = company_params = {
        "industry": "IT",
        "country": "Israel",
        "founded_in": 2010,
        "specialization": "CS.",
        "num_employees": 10,
        "revenue": 1
    }
    """
    

    
    request_data = json.loads(http_request_body)

    company_params = {
        "industry": request_data.get("industry_code"),
        "country": request_data.get("country_code"),
        "founded_in": safe_int(request_data.get("founded_in")),
        "specialization": request_data.get("specialization_code"),
        "num_employees": safe_int(request_data.get("num_employees")),
        "revenue": safe_float(request_data.get("revenue"))
    }
    

    return company_params


def validate_company_params(company_params: dict) -> dict:

    validation_report = {
        "status_code": 0
    }

    return validation_report


def fetch_acquire_cases() -> dict:

    viewer_url = get_config("MICROSERVICES", "cases-viewer")

    return fetch_cases(viewer_url)


def reverce_similarity(v1: float, v2: float, base: float) -> float:

    return base**(-abs(v1 - v2))


def case_similarity(sample: dict, caze: dict) -> int:

    similarity = 0

    if sample["industry"] == caze["acquiree_industry_code"]: 
        similarity += 1

    if sample["specialization"] == caze["acquiree_specialization_code"]: 
        similarity += 1

    if sample["country"] == caze["acquiree_country_code"]: 
        similarity += 1

    sample_age = 2023 - sample["founded_in"]
    case_age = caze["acquired_in"] - caze["acquiree_founded_in"]
    similarity += reverce_similarity(sample_age, case_age, 1.1)

    similarity += reverce_similarity(sample["revenue"], caze["acquiree_revenue"], 1.01)

    return similarity


def evaluate_company(company_params: dict, cases: list) -> dict:

    
    case_top1 = {"similarity": 0}
    case_top2 = {"similarity": 0}
    case_top3 = {"similarity": 0}

    for caze in cases:

        caze["similarity"] = case_similarity(company_params, caze)
        caze["rate"] = caze["deal_price"]/caze["acquiree_revenue"]

        if case_top1["similarity"] < caze["similarity"]:
            case_top1 = caze
        elif case_top2["similarity"] < caze["similarity"]:
            case_top2 = caze
        elif case_top3["similarity"] < caze["similarity"]:
            case_top3 = caze

    mean_rate = (0.5*case_top1["rate"] + 0.3*case_top2["rate"] + 0.2*case_top3["rate"])

    # print(mean_rate)

    evaluation = {
        "company_value": round(company_params["revenue"]*mean_rate, 2), 
        "similar_cases": [case_top1, case_top2, case_top3]
    }

    return evaluation


def serialize_report(report: dict) -> str:

    serialized_report = json.dumps(report)

    return serialized_report


def process_request(): 

    http_request_body = sys.stdin.read(int(os.environ.get("CONTENT_LENGTH", "0")))

    file_path = 'c:/tmp/!!/log.txt'
    file = open(file_path, 'w')
    string_to_write = http_request_body
    file.write(string_to_write)
    file.close()

    company_params = parse_company_params(http_request_body)

    validation_report = validate_company_params(company_params)

    if validation_report["status_code"] == 0:

        cases = fetch_acquire_cases()

        evaluation = evaluate_company(company_params, cases)

        report = {
            "status_code": 0,
            "evaluation": evaluation
        }
    else:
        report = {
            "status_code": 1,
            "evaluation": None
        }

    print("Content-type: application/json")
    print("\n")
    print(serialize_report(report))


process_request()
