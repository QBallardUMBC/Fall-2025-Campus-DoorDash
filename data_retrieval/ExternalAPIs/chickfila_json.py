import os
import json
import cloudscraper
import pandas as pd
from dotenv import load_dotenv

# Load env
load_dotenv()

scraper = cloudscraper.create_scraper()

# Build URL
API = os.getenv("DINEONCAMPUS_API")
LOCATION_CHICKFILA = os.getenv("LOCATION_CHICKFILA")
url = f"{API}/location/{LOCATION_CHICKFILA}/periods"

# Params
params = {
    "platform": os.getenv("PLATFORM"),
    "date": os.getenv("DEFAULT_DATE"),
}

# Headers
headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

resp = scraper.get(url, params=params, headers=headers)
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))

data = resp.json()["menu"]
periods = data["periods"]
categories = periods["categories"]
#items = categories["items"]

def get_food():
    all_food = []
    for cate in categories:
        for food in cate.get("items", []):
            food_items = {
                "category_name": cate["name"],
                "category_id": cate["id"],
                "food_id": food["id"],
                "food_name": food["name"]
            }
            all_food.append(food_items)
    return pd.DataFrame(all_food)

def get_nutrients():
    all_food = []
    for cate in categories:
        for food in cate.get("items", []):
            for nut in food.get("nutrients", []):
                food_items = {
                    "food_id": food["id"],
                    "nutrient_name": nut["name"],
                    "nutrient_value": nut["value"]
                }
                all_food.append(food_items)
    return pd.DataFrame(all_food)


print(get_food())
print(get_nutrients())