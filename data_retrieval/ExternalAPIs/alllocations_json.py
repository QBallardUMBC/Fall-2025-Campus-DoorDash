import os
import json
import cloudscraper
import pandas as pd
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

# Create a scraper session (handles Cloudflare)
scraper = cloudscraper.create_scraper()

# Build URL from env
API = os.getenv("DINEONCAMPUS_API")
url = f"{API}/locations/all_locations"

# Query parameters from env
params = {
    "platform": os.getenv("PLATFORM"),
    "site_id": os.getenv("SITE_ID"),
    "for_menus": os.getenv("FOR_MENUS"),
    "with_address": os.getenv("WITH_ADDRESS"),
    "with_buildings": os.getenv("WITH_BUILDINGS"),
}

# Headers from env
headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

# Make request
resp = scraper.get(url, params=params, headers=headers)

# Pretty-print JSON response
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))

data = resp.json()["buildings"]

print(data)
all_locations = []

def get_locations():
    for building in data:
        building_locations = {
            "location_id": building["id"],
            "location_name": building["name"],
            "location_type": building["type"],
        }
        all_locations.append(building_locations)

    new_all_locations = pd.DataFrame(all_locations)
    return new_all_locations

all_restaurants = []
def get_restaurants():
    for building in data:  # loop over buildings
        for restaurant in building["locations"]:  # loop over each restaurant inside building
            restaurants = {
                "restaurant_id": restaurant["id"],
                "building_id": restaurant["building_id"],
                "restaurant_name": restaurant["name"]
            }
            all_restaurants.append(restaurants)

    new_all_restaurants = pd.DataFrame(all_restaurants)
    return new_all_restaurants

print(get_restaurants())

print(get_locations())
print(get_restaurants())