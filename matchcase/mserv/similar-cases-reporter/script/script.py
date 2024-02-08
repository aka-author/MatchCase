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

import numpy as np
from sklearn.linear_model import LinearRegression

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


def measure_values_reverse_similarity(v1: float, v2: float, base: float) -> float:

    return base**(-abs(v1 - v2))


def assemble_company_case(company: dict) -> dict:

    company_case = {
        "acquiree_country_code": company["country"],
        "acquiree_founded_in": datetime.now().year - company["founded_in"],
        "acquiree_industry_code": company["industry"],
        "acquiree_specialization_code": company["specialization"],
        "acquiree_revenue": company["revenue"]
    }

    return company_case


def measure_cases_similarity(
    case1: dict, 
    case2: dict, 
    dependent_varname: str=None) -> int:

    abs_similarity = 0

    variable_count = 0

    # Country
    if case1["acquiree_country_code"] == case2["acquiree_country_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Age
    sample_age = datetime.now().year - case1["acquiree_founded_in"]
    case_age = case2["acquired_in"] - case2["acquiree_founded_in"]
    
    abs_similarity += measure_values_reverse_similarity(
        sample_age, case_age, 
        1.1
    )
    
    variable_count += 1

    # Industry
    if case1["acquiree_industry_code"] == case2["acquiree_industry_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Specialization
    if case1["acquiree_specialization_code"] == case2["acquiree_specialization_code"]: 
        abs_similarity += 1
    variable_count += 1

    # Revenue
    if dependent_varname != "acquiree_revenue":
        
        abs_similarity += measure_values_reverse_similarity(
            case1["acquiree_revenue"], 
            case2["acquiree_revenue"], 
            1.01
        )

        variable_count += 1

    similarity = abs_similarity/variable_count

    return similarity


def prepare_regression_model(x_vect: list, y_vect: list)  -> LinearRegression:

    x_column = np.array(x_vect).reshape(-1, 1)

    model = LinearRegression()
    model.fit(x_column, y_vect)

    return model


def get_regression_coeffs(trained_model: LinearRegression):

    return trained_model.coef_[0], trained_model.intercept_


def predict_with_regression(x: float, trained_model: LinearRegression) -> float: 

    x_column = np.array([x]).reshape(-1, 1)

    y_prediction = trained_model.predict(x_column)[0]

    return y_prediction


def get_col_values(colname: str, cases: dict) -> list:

    return [caze[colname] for caze in cases]


def predict_company_price(company_case: dict, cases: list, count_top: int=20) -> dict:

    for caze in cases:
        caze["similarity"] = measure_cases_similarity(company_case, caze)
        caze["acquiree_age"] = caze["acquired_in"] - caze["acquiree_founded_in"]
        caze["rate"] = caze["deal_price"]/caze["acquiree_revenue"]

    similar_cases = sorted(
        cases, 
        key = lambda caze: caze['similarity'], reverse=True
    )

    top_similar_cases = similar_cases[:count_top]

    revenues = get_col_values("acquiree_revenue", top_similar_cases)
    prices = get_col_values("deal_price", top_similar_cases)

    price_prediction_model = prepare_regression_model(revenues, prices)

    company_price_prediction = round(
        predict_with_regression(
            company_case["acquiree_revenue"], 
            price_prediction_model
        ), 2
    )
    
    a, b = get_regression_coeffs(price_prediction_model)

    prediction = {
        "company_value": company_price_prediction, 
        "similar_cases": top_similar_cases,
        "trend": {"a": a, "b": b}
    }

    return prediction


def serialize_report(report: dict) -> str:

    serialized_report = json.dumps(report)

    return serialized_report


def process_request(): 

    http_request_body = None

    
    http_request_body = sys.stdin.read(int(os.environ.get("CONTENT_LENGTH", "0")))
    
    file_path = 'c:/tmp/!!/log.txt'
    file = open(file_path, 'w')
    string_to_write = http_request_body
    file.write(string_to_write)
    file.close()

    company_params = parse_company_params(http_request_body)

    validation_report = validate_company_params(company_params)

    if validation_report["status_code"] == 0:

        company_case = assemble_company_case(company_params)
        cases = fetch_acquire_cases()

        prediction = predict_company_price(company_case, cases)

        report = {
            "status_code": 0,
            "evaluation": prediction
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
