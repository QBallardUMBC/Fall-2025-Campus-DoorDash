import os
import json
import cloudscraper
from dotenv import load_dotenv

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
