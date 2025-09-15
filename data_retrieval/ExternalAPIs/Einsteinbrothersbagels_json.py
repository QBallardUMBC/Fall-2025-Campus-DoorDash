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
LOCATION_EINSTEIN = os.getenv("LOCATION_EINSTEIN")
url = f"{API}/location/{LOCATION_EINSTEIN}/periods"

# Query parameters
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

# Make request
resp = scraper.get(url, params=params, headers=headers)

# Pretty-print JSON
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
