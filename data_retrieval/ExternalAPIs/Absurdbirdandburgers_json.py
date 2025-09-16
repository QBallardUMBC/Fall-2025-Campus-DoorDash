import os
import json
import cloudscraper
import pandas as pd
from alllocations_json import get_restaurants
from supabase import create_client, Client
from dotenv import load_dotenv

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_KEY")
supabase: Client = create_client(url, key)

# Load environment variables from .env
load_dotenv()

# Create a scraper session (bypasses Cloudflare)
scraper = cloudscraper.create_scraper()

# Build URL dynamically
API = os.getenv("DINEONCAMPUS_API")
LOCATION_ABSURD = os.getenv("LOCATION_ABSURD_BIRD")
url = f"{API}/location/{LOCATION_ABSURD}/periods"

# Query parameters
params = {
    "platform": os.getenv("PLATFORM"),
    "date": os.getenv("DEFAULT_DATE")  # You can override this when needed
}

# Headers
headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

# Request data
resp = scraper.get(url, params=params, headers=headers)

# Pretty-print JSON
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))

data = resp.json()["menu"]
periods = data["periods"]
categories = periods["categories"]
first = categories[0]
items = first["items"]
#print(data)

def food_items():
    all_data = []

    for menu in items:
        item_data ={
            "food_id": menu["id"],
            "food_name": menu["name"],
            "ingredients": menu["ingredients"]
        }
        all_data.append(item_data)
    return pd.DataFrame(all_data)

def nutrition_item():
    all_data = []

    for item in items:
        for nutrion in item["nutrients"]:
            nutrition_data = {
                "food_id": item["id"],
                "nutrition_name": nutrion["name"],
                "nutrition_val": nutrion["value"]
           }
            all_data.append(nutrition_data)
    return pd.DataFrame(all_data)
print(food_items())
print(nutrition_item())