#!python3
#encoding: utf-8

# System:   Consulting Company Website
# Module:   MatchCase
# Block:    Microservice similar-cases-reporter
# File:     CGI-script


import os
import sys
import pathlib
import configparser
import json
from datetime import datetime
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


def case_similarity(sample: dict, caze: dict, dependent_varname=None) -> int:

    abs_similarity = 0

    variable_count = 0

    # Country
    if sample["country"] == caze["acquiree_country_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Age
    sample_age = datetime.now().year - sample["founded_in"]
    case_age = caze["acquired_in"] - caze["acquiree_founded_in"]
    abs_similarity += reverce_similarity(sample_age, case_age, 1.1)
    variable_count += 1

    # Industry
    if sample["industry"] == caze["acquiree_industry_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Specialization
    if sample["specialization"] == caze["acquiree_specialization_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Revenue
    if dependent_varname != "revenue":
        abs_similarity += reverce_similarity(sample["revenue"], caze["acquiree_revenue"], 1.01)
        variable_count += 1

    similarity = abs_similarity/variable_count

    return similarity


def evaluate_company(company_params: dict, cases: list, count_top: int=20) -> dict:

    for caze in cases:
        caze["similarity"] = case_similarity(company_params, caze)
        caze["acquiree_age"] = caze["acquired_in"] - caze["acquiree_founded_in"]
        caze["rate"] = caze["deal_price"]/caze["acquiree_revenue"]

    selected_cases = sorted(cases, key=lambda x: x['similarity'], reverse=True)[:count_top] 

    total = sum(caze["similarity"] for caze in selected_cases)
    weights = [caze["similarity"]/total for caze in selected_cases]

    weighted_average_rate = 0
    for i in range(count_top):
        weighted_average_rate += weights[i]*selected_cases[i]["rate"]
    weighted_average_rate /= count_top


    # print(mean_rate)

    evaluation = {
        "company_value": round(company_params["revenue"]*weighted_average_rate, 2), 
        "similar_cases": selected_cases,
        "trend": {"a": 5, "b": 30}
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
