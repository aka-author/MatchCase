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
from scipy import stats

from directory_viewer_client import fetch_countries
from cases_viewer_client import fetch_cases


# Utils

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


# Countries

def fetch_countries_directory(lang_code: str="en") -> dict:

    viewer_url = get_config("MICROSERVICES", "directories-viewer")

    return fetch_countries(viewer_url, lang_code)


def get_country_info(country_code: str, countries: list) -> dict:

    country_info = {
        "country_code2": "??", 
        "en": "Unknown", 
        "regime_type": "Dolbocrathy"
    }

    for country in countries:
        if country["country_code2"] == country_code:
            country_info = country
            break

    return country_info


def get_country_regime_type(country_code: str, countries: list) -> str:

    return get_country_info(country_code, countries).get("regime_type")


def compare_regimes(regime1: str, regime2: str) -> float:

    if regime1 == regime2:
        return 1

    if regime1.find("democracy") != -1 and regime2.find("democracy") != -1:
        return 0.75
    
    return 1


# Cases

def fetch_acquire_cases() -> dict:

    viewer_url = get_config("MICROSERVICES", "cases-viewer")

    return fetch_cases(viewer_url)
 

# Company 

def parse_company_params(http_request_body: str) -> dict:

    if DEBUG_MODE:
        request_data = company_params = {
            "industry": "IT",
            "country": "IL",
            "founded_in": 2010,
            "specialization": "CS.",
            "num_employees": 10,
            "revenue": 1
        }
    
    
    if not DEBUG_MODE:
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


def assemble_company_case(company: dict) -> dict:

    country_code = company["country"]

    company_case = {
        "acquiree_country_code": country_code,
        "acquiree_founded_in": company["founded_in"],
        "acquiree_industry_code": company["industry"],
        "acquiree_specialization_code": company["specialization"],
        "acquiree_num_employees": company["num_employees"],
        "acquiree_revenue": company["revenue"]
    }

    return company_case


# Calculations 

def fraction_string_to_float(fraction_str: str) -> float:
    try:
        numerator, denominator = map(int, fraction_str.split('/'))
        result = numerator / denominator
        return result
    except ValueError:
        return float('inf')
    

def measure_values_reverse_similarity(
    v1: float, 
    v2: float, 
    base: float) -> float:

    return base**(-abs(v1 - v2))


def measure_cases_similarity(
    case1: dict, 
    case2: dict, 
    countries: list,
    dependent_varname: str=None) -> int:

    abs_similarity = 0

    variable_count = 0

    # Country

    if case1["acquiree_country_code"] == case2["acquiree_country_code"]: 
        abs_similarity += 1
    else:
        regime1 = get_country_regime_type(
            case1["acquiree_country_code"], 
            countries
        )

        regime2 = get_country_regime_type(
            case2["acquiree_country_code"], 
            countries
        )

        abs_similarity += compare_regimes(regime1, regime2)
    
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

    # Number of employees
    abs_similarity += measure_values_reverse_similarity(
            case1["acquiree_num_employees"], 
            case2["acquiree_num_employees"], 
            1.01
        )

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


def detect_outliers(data, colname, threshold=2.0):
    values = [entry[colname] for entry in data]
    z_scores = stats.zscore(values)
    outliers = [i for i in range(len(data)) if abs(z_scores[i]) > threshold]
    
    return outliers


def separate_outliers(cases: list, colname: str) -> "tuple(list, list)":

    regular_cases = []
    outlier_cases = []

    outlier_indices = detect_outliers(cases, colname, 1.0)

    for idx, caze in enumerate(cases):
        if not (idx in outlier_indices):
            caze["outlier_flag"] = False
            regular_cases.append(caze)
        else:
            caze["outlier_flag"] = True
            outlier_cases.append(caze)

    return regular_cases, outlier_cases


def prepare_regression_model(x_vect: list, y_vect: list) -> LinearRegression:

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


def predict_company_price(
    company_case: dict, 
    cases: list, 
    countries: list, 
    count_top: int=20
) -> dict:

    for caze in cases:
        caze["similarity"] = measure_cases_similarity(company_case, caze, countries)
        caze["acquiree_age"] = caze["acquired_in"] - caze["acquiree_founded_in"]
        caze["rate"] = caze["deal_price"]/caze["acquiree_revenue"]

    similar_cases = sorted(
        cases, 
        key = lambda caze: caze['similarity'], reverse=True
    )

    top_similar_cases = similar_cases[:count_top]

    regular_cases, outlier_cases = separate_outliers(
        top_similar_cases, 
        "deal_price"
    )

    revenues = get_col_values("acquiree_revenue", regular_cases)
    prices = get_col_values("deal_price", regular_cases)

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
        "similar_cases": regular_cases + outlier_cases,
        "trend": {"a": a, "b": b}
    }

    return prediction


def serialize_report(report: dict) -> str:

    serialized_report = json.dumps(report)

    return serialized_report


# Main

def process_request(): 

    if DEBUG_MODE:
        print("DEBUG_MODE=", DEBUG_MODE)

    http_request_body = None

    if not DEBUG_MODE:
        http_request_body = sys.stdin.read(int(os.environ.get("CONTENT_LENGTH", "0")))
    
        file_path = 'c:/tmp/!!/log.txt'
        file = open(file_path, 'w')
        string_to_write = http_request_body
        file.write(string_to_write)
        file.close()
    
    company_params = parse_company_params(http_request_body)

    validation_report = validate_company_params(company_params)

    if validation_report["status_code"] == 0:

        countries = fetch_countries_directory("en")
        cases = fetch_acquire_cases()
        company_case = assemble_company_case(company_params)
        
        prediction = predict_company_price(company_case, cases, countries)

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


DEBUG_MODE = False

process_request()
