import os
import json
import cloudscraper
import pandas as pd
from datetime import date
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()
restaurant_id = "587f9cf7ee596fb5350cc155"
# Create a scraper session (bypasses Cloudflare)
scraper = cloudscraper.create_scraper()

today = date.today().strftime("%Y-%m-%d")

API = os.getenv("DINEONCAMPUS_API")
LOCATION_ABSURD = os.getenv("LOCATION_ABSURD_BIRD")
url = f"{API}/location/{LOCATION_ABSURD}/periods"

params = {
    "platform": os.getenv("PLATFORM"),
    "date": today
}

headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

resp = scraper.get(url, params=params, headers=headers)

#print(json.dumps(resp.json(), indent=2, ensure_ascii=False))

data = resp.json()["menu"]
_raw_periods = data.get("periods", [])
periods = _raw_periods if isinstance(_raw_periods, list) else [_raw_periods]
#categories = periods["categories"]
#items = categories["items"]

def absurd_get_period():
    all_periods = []
    for period in periods:
        all_periods_dict = {
            "restaurant_id": restaurant_id,
            "period_id": period["id"],
            "period_name": period["name"]
        }
        all_periods.append(all_periods_dict)
    return pd.DataFrame(all_periods)

def absurd_get_food():
    all_food = []
    for period in periods:
        for cate in period.get("categories", []):
            for food in cate.get("items", []):
                food_items = {
                    "restaurant_id": restaurant_id,
                    "period_id": period["id"],
                    "category_id": cate["id"],
                    "food_id": food["id"],
                    "food_name": food["name"]
                }
                all_food.append(food_items)
    return pd.DataFrame(all_food)

def absurd_get_cate():
    all_cate = []
    for period in periods:
        for cate in period.get("categories", []):
            categories_dict = {
                "restaurant_id": restaurant_id,
                "period_id": period["id"],
                "category_id": cate["id"],
                "category_name": cate["name"]
            }
            all_cate.append(categories_dict)
    return pd.DataFrame(all_cate)

def anbsurd_get_nutrients():
    all_food = []
    for period in periods:
        for cate in period.get("categories", []):
            for food in cate.get("items", []):
                for nut in food.get("nutrients", []):
                    food_items = {
                        "food_id": food["id"],
                        "nutrient_name": nut["name"],
                        "nutrient_value": nut["value"]
                    }
                    all_food.append(food_items)
    return pd.DataFrame(all_food)

#print(absurd_get_period())
#print(absurd_get_cate())
#print(get_food())
#print(get_nutrients())