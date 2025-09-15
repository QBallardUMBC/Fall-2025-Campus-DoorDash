import os
import json
import cloudscraper
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create a scraper session (bypasses Cloudflare)
scraper = cloudscraper.create_scraper()

# Build URL from env
API = os.getenv("DINEONCAMPUS_API")
LOCATION_DUNKIN = os.getenv("LOCATION_DUNKIN")
url = f"{API}/location/{LOCATION_DUNKIN}/periods"

# Query parameters
params = {
    "platform": os.getenv("PLATFORM"),
    "date": os.getenv("DEFAULT_DATE"),  # change in .env instead of here
}

# Headers
headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

# Request and pretty-print JSON
resp = scraper.get(url, params=params, headers=headers)
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
