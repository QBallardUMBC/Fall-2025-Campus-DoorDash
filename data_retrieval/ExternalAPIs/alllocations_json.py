import os
import json
import cloudscraper
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
