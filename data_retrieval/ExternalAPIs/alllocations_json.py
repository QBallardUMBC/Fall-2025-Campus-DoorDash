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
                "location_id": restaurant["building_id"],
                "restaurant_name": restaurant["name"]
            }
            all_restaurants.append(restaurants)

    new_all_restaurants = pd.DataFrame(all_restaurants)
    return new_all_restaurants

def get_manual_location_data():
    manual_lo_data = [
        # --- Admin & Student Services ---
        #{"location_id": 1, "location_name": "Administration Building", "location_type": "building"},
        #{"location_id": 2, "location_name": "Library & Gallery, Albin O. Kuhn", "location_type": "library"},
        #{"location_id": 3, "location_name": "The Commons", "location_type": "student_center"},
        #{"location_id": 4, "location_name": "University Center", "location_type": "student_center"},
        {"location_id": 5, "location_name": "Alumni House", "location_type": "building"},
        {"location_id": 6, "location_name": "Student Development & Success Center", "location_type": "student_services"},

        # --- Academic ---
        {"location_id": 7, "location_name": "Engineering Building", "location_type": "academic"},
        {"location_id": 8, "location_name": "Information Technology/Engineering (ITE)", "location_type": "academic"},
        {"location_id": 9, "location_name": "Meyerhoff Chemistry Building", "location_type": "academic"},
        {"location_id": 10, "location_name": "Mathematics & Psychology Building", "location_type": "academic"},
        {"location_id": 11, "location_name": "Physics Building", "location_type": "academic"},
        {"location_id": 12, "location_name": "Performing Arts & Humanities Building", "location_type": "academic"},
        {"location_id": 13, "location_name": "Public Policy Building", "location_type": "academic"},
        {"location_id": 14, "location_name": "Sherman Hall", "location_type": "academic"},
        {"location_id": 15, "location_name": "Sondheim Hall", "location_type": "academic"},
        {"location_id": 16, "location_name": "Fine Arts Building", "location_type": "academic"},
        {"location_id": 17, "location_name": "Biological Sciences Building", "location_type": "academic"},
        {"location_id": 18, "location_name": "Interdisciplinary Life Sciences Building (ILSB)", "location_type": "academic"},
        {"location_id": 19, "location_name": "Technology Research Center (TRC)", "location_type": "research"},
        {"location_id": 20, "location_name": "Tech 2 Building", "location_type": "research"},
        {"location_id": 21, "location_name": "Lecture Hall 1", "location_type": "academic"},
        {"location_id": 22, "location_name": "The Center for Well-Being", "location_type": "student_services"},

        # --- Athletics & Events ---
        {"location_id": 23, "location_name": "Retriever Activities Center (RAC)", "location_type": "athletics"},
        {"location_id": 24, "location_name": "Chesapeake Employers Insurance Arena", "location_type": "athletics"},
        {"location_id": 25, "location_name": "UMBC Stadium Complex", "location_type": "athletics"},

        # --- Research & Tech Park ---
        {"location_id": 26, "location_name": "bwtech@UMBC North", "location_type": "research"},
        {"location_id": 27, "location_name": "bwtech@UMBC South", "location_type": "research"},

        # --- Residence Halls ---
        {"location_id": 28, "location_name": "Erickson Hall", "location_type": "residence"},
        {"location_id": 29, "location_name": "Harbor Hall", "location_type": "residence"},
        {"location_id": 30, "location_name": "Potomac Hall", "location_type": "residence"},
        {"location_id": 31, "location_name": "Chesapeake Hall", "location_type": "residence"},
        {"location_id": 32, "location_name": "Susquehanna Hall", "location_type": "residence"},
        {"location_id": 33, "location_name": "Patapsco Hall", "location_type": "residence"},

        # --- Apartments: Walker (whole complex only) ---
        {"location_id": 34, "location_name": "Walker Avenue Apartments", "location_type": "residence"},

        # --- Apartments: Hillside (broken down) ---
        {"location_id": 35, "location_name": "Hillside - Sideling", "location_type": "residence"},
        {"location_id": 36, "location_name": "Hillside - Pocomoke", "location_type": "residence"},
        {"location_id": 37, "location_name": "Hillside - Manokin", "location_type": "residence"},
        {"location_id": 38, "location_name": "Hillside - Patuxent", "location_type": "residence"},
        {"location_id": 39, "location_name": "Hillside - Elk", "location_type": "residence"},
        {"location_id": 40, "location_name": "Hillside - Deep Creek", "location_type": "residence"},
        {"location_id": 41, "location_name": "Hillside - Casselman", "location_type": "residence"},
        {"location_id": 42, "location_name": "Hillside - Breton", "location_type": "residence"},

        # --- Apartments: Terrace (broken down) ---
        {"location_id": 43, "location_name": "Terrace - Nanticoke", "location_type": "residence"},
        {"location_id": 44, "location_name": "Terrace - Gunpowder", "location_type": "residence"},
        {"location_id": 45, "location_name": "Terrace - Monocacy", "location_type": "residence"},
        {"location_id": 46, "location_name": "Terrace - Sassafras", "location_type": "residence"},
        {"location_id": 47, "location_name": "Terrace - Wicomico", "location_type": "residence"},
        {"location_id": 48, "location_name": "Terrace - Antietam", "location_type": "residence"},
        {"location_id": 49, "location_name": "Terrace - Chincoteague", "location_type": "residence"},
        {"location_id": 50, "location_name": "Terrace - Tuckahoe", "location_type": "residence"},

        # --- Apartments: West Hill (broken down) ---
        {"location_id": 51, "location_name": "West Hill - Chester", "location_type": "residence"},
        {"location_id": 52, "location_name": "West Hill - Wye", "location_type": "residence"},
        {"location_id": 53, "location_name": "West Hill - Magothy", "location_type": "residence"},
        {"location_id": 54, "location_name": "West Hill - Tangier", "location_type": "residence"},
        {"location_id": 55, "location_name": "West Hill - Choptank", "location_type": "residence"},

        # --- Facilities & Services ---
        {"location_id": 56, "location_name": "Army ROTC", "location_type": "facility"},
        {"location_id": 57, "location_name": "Naval ROTC", "location_type": "facility"},
        {"location_id": 58, "location_name": "Central Plant", "location_type": "facility"},
        {"location_id": 59, "location_name": "Satellite Utility Plant", "location_type": "facility"},
        {"location_id": 60, "location_name": "Greenhouse", "location_type": "facility"},
        {"location_id": 61, "location_name": "Preschool Center", "location_type": "facility"},
        {"location_id": 62, "location_name": "Facilities Management Building", "location_type": "facility"},
        {"location_id": 63, "location_name": "Warehouse", "location_type": "facility"},
        {"location_id": 64, "location_name": "900 Walker", "location_type": "building"},
        #{"location_id": 65, "location_name": "True Grit’s", "location_type": "dining"},
    ]
    return pd.DataFrame(manual_lo_data)

print(get_manual_location_data())
print(get_restaurants())

print(get_locations())
