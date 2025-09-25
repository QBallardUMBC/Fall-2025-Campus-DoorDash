import os
import pandas as pd
import uuid
from dotenv import load_dotenv
from supabase import create_client, Client
from data_retrieval.ExternalAPIs.alllocations_json import get_locations, get_manual_location_data, get_restaurants
from data_retrieval.data_filtering.data_fuse import get_all_categories, get_all_foods, get_all_nutrients, get_all_periods
from data_retrieval.data_filtering.utils import df_records
load_dotenv()

url: str = os.getenv("SUPABASE_URL")
key: str = os.getenv("SUPABASE_ROLE_KEY")
supabase: Client = create_client(url, key)



#response = (
#    supabase.table("")
#    .upsert({"id": 1, "name": "piano"})
#    .execute()
#)

locations_df = get_locations()
manual_lo_df = get_manual_location_data()
resaurant_data = get_restaurants()
print(resaurant_data)
def upsert_df(table: str, df: pd.DataFrame, on_conflict: str, batch_size: int = 500):
    rows = df_records(df)
    for i in range(0, len(rows), batch_size):
        chunk = rows[i:i+batch_size]
        if not chunk:
            continue
        res = supabase.table(table).upsert(chunk, on_conflict=on_conflict).execute()
        print(res)

def insert_df(table: str, df: pd.DataFrame, batch_size: int = 500):
    rows = df_records(df)
    for i in range(0, len(rows), batch_size):
        chunk = rows[i:i+batch_size]
        if not chunk:
            continue
        # INSERT 
        res = supabase.table(table).insert(chunk).execute()
        # print(res)

print(get_all_nutrients().columns)

#upsert_df("restaurants", resaurant_data, on_conflict="old_restaurant_id", batch_size=500)
#insert_df("restaurants", resaurant_data, batch_size=500)
#insert_df("periods", get_all_periods(), batch_size=500)
#insert_df("categories", get_all_categories(), batch_size=500)
#insert_df("food", get_all_foods(), batch_size=500)
insert_df("nutrients", get_all_nutrients(), batch_size=500)


#insert_df("periods", , batch_size=500)

locations_df = []

"""

This query was used and manipulated to update the tables ids accross the database

UPDATE public.nutrients r
SET    food_id = l.food_id
FROM   public.food l
WHERE  r.old_food_id = l.old_food_id
  AND  r.food_id IS DISTINCT FROM l.food_id;
"""