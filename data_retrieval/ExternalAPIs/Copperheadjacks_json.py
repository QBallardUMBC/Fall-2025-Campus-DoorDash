import os
import json
import cloudscraper
from dotenv import load_dotenv

load_dotenv()
scraper = cloudscraper.create_scraper()

API = os.getenv("DINEONCAMPUS_API")
LOCATION_COPPERHEAD = os.getenv("LOCATION_COPPERHEADJACKS")
url = f"{API}/location/{LOCATION_COPPERHEAD}/periods"

params = {
    "platform": os.getenv("PLATFORM"),
    "date": os.getenv("DEFAULT_DATE"),
}

headers = {
    "accept": os.getenv("HEADERS_ACCEPT"),
    "origin": os.getenv("HEADERS_ORIGIN"),
    "referer": os.getenv("HEADERS_REFERER"),
    "user-agent": os.getenv("HEADERS_USER_AGENT"),
}

resp = scraper.get(url, params=params, headers=headers)
print(json.dumps(resp.json(), indent=2, ensure_ascii=False))
