import os
import pandas as pd
import uuid
from dotenv import load_dotenv
from data_retrieval.ExternalAPIs.Absurdbirdandburgers_json import absurd_get_cate, absurd_get_food, absurd_get_period, anbsurd_get_nutrients
from data_retrieval.ExternalAPIs.chickfila_json import chick_get_cate, chick_get_food, chick_get_nutrients, chick_get_period
from data_retrieval.ExternalAPIs.Coffeeshop_json import coffee_get_cate, coffee_get_food, coffee_get_nutrients, coffee_get_period
from data_retrieval.ExternalAPIs.Copperheadjacks_json import copper_get_cate, copper_get_food, copper_get_nutrients, copper_get_period
from data_retrieval.ExternalAPIs.Dunkin import dunkin_get_cate, dunkin_get_food, dunkin_get_nutrients, dunkin_get_period
from data_retrieval.ExternalAPIs.Einsteinbrothersbagels_json import einstein_get_cate, einstein_get_food, einstein_get_nutrients, einstein_get_period
from data_retrieval.ExternalAPIs.halalshack_json import halal_get_cate, halal_get_food, halal_get_nutrients, halal_get_period
from data_retrieval.ExternalAPIs.Indiankitchen_json import indian_get_cate, indian_get_food, indian_get_nutrients, indian_get_period
from data_retrieval.ExternalAPIs.PiccoliaItalia_json import piccolia_get_cate, piccolia_get_food, piccolia_get_nutrients, piccolia_get_period
from data_retrieval.ExternalAPIs.skylightroom_json import sky_get_cate, sky_get_food, sky_get_nutrients, sky_get_period
from data_retrieval.ExternalAPIs.Starbucks_json import starbucks_get_cate, starbucks_get_food, starbucks_get_nutrients, starbucks_get_period
from data_retrieval.ExternalAPIs.sushido_json import sushido_get_cate, sushido_get_food, sushido_get_nutrients, sushido_get_period
from data_retrieval.ExternalAPIs.truegrits_json import grit_get_cate, grit_get_food, grit_get_nutrients, grit_get_period
from data_retrieval.ExternalAPIs.wildgreens_json import green_get_cate, green_get_food, green_get_nutrients, green_get_period

load_dotenv()

def _to_df(x):
    if isinstance(x, pd.DataFrame):
        return x.copy()
    return pd.DataFrame(x or [])

def _safe_call(vendor: str, fn):
    try:
        df = _to_df(fn())
        if not df.empty:
            df["restaurant"] = vendor
        return df
    except Exception as e:
        print(f"[WARN] {vendor}: {fn.__name__} failed -> {e}")
        return pd.DataFrame()

def _fuse_from_map(func_map: dict[str, callable]):
    frames = []
    for vendor, fn in func_map.items():
        frames.append(_safe_call(vendor, fn))
    if not frames:
        return pd.DataFrame()
    fused = pd.concat(frames, ignore_index=True, sort=False)

    for col in fused.columns:
        if col.endswith("_id") or col in ("id",):
            fused[col] = fused[col].astype(str, errors="ignore")
    return fused

CATE_FUNCS = {
    "absurd": absurd_get_cate,
    "chickfila": chick_get_cate,
    "coffee_shop": coffee_get_cate,
    "copperhead_jacks": copper_get_cate,
    "dunkin": dunkin_get_cate,
    "einstein_bros": einstein_get_cate,
    "halal_shack": halal_get_cate,
    "indian_kitchen": indian_get_cate,
    "piccola_italia": piccolia_get_cate,
    "skylight_room": sky_get_cate,
    "starbucks": starbucks_get_cate,
    "sushido": sushido_get_cate,
    "true_grits": grit_get_cate,
    "wild_greens": green_get_cate,
}

PERIOD_FUNCS = {
    "absurd": absurd_get_period,
    "chickfila": chick_get_period,
    "coffee_shop": coffee_get_period,
    "copperhead_jacks": copper_get_period,
    "dunkin": dunkin_get_period,
    "einstein_bros": einstein_get_period,
    "halal_shack": halal_get_period,
    "indian_kitchen": indian_get_period,
    "piccola_italia": piccolia_get_period,
    "skylight_room": sky_get_period,
    "starbucks": starbucks_get_period,
    "sushido": sushido_get_period,
    "true_grits": grit_get_period,
    "wild_greens": green_get_period,
}

FOOD_FUNCS = {
    "absurd": absurd_get_food,
    "chickfila": chick_get_food,
    "coffee_shop": coffee_get_food,
    "copperhead_jacks": copper_get_food,
    "dunkin": dunkin_get_food,
    "einstein_bros": einstein_get_food,
    "halal_shack": halal_get_food,
    "indian_kitchen": indian_get_food,
    "piccola_italia": piccolia_get_food,
    "skylight_room": sky_get_food,
    "starbucks": starbucks_get_food,
    "sushido": sushido_get_food,
    "true_grits": grit_get_food,
    "wild_greens": green_get_food,
}

NUTRIENT_FUNCS = {
    "absurd": anbsurd_get_nutrients,
    "chickfila": chick_get_nutrients,
    "coffee_shop": coffee_get_nutrients,
    "copperhead_jacks": copper_get_nutrients,
    "dunkin": dunkin_get_nutrients,
    "einstein_bros": einstein_get_nutrients,
    "halal_shack": halal_get_nutrients,
    "indian_kitchen": indian_get_nutrients,
    "piccola_italia": piccolia_get_nutrients,
    "skylight_room": sky_get_nutrients,
    "starbucks": starbucks_get_nutrients,
    "sushido": sushido_get_nutrients,
    "true_grits": grit_get_nutrients,
    "wild_greens": green_get_nutrients,
}

def fuse_categories() -> pd.DataFrame:
    return _fuse_from_map(CATE_FUNCS)

def fuse_periods() -> pd.DataFrame:
    return _fuse_from_map(PERIOD_FUNCS)

def fuse_foods() -> pd.DataFrame:
    return _fuse_from_map(FOOD_FUNCS)

def fuse_nutrients() -> pd.DataFrame:
    return _fuse_from_map(NUTRIENT_FUNCS)

all_categories = fuse_categories()
all_periods    = fuse_periods()
all_foods      = fuse_foods()
all_nutrients  = fuse_nutrients()

all_categories.drop(columns=["restaurant"], inplace=True)
all_periods.drop(columns=["restaurant"], inplace=True)
all_foods.drop(columns=["restaurant"], inplace=True)
all_nutrients.drop(columns=["restaurant"], inplace=True)

print("cats:", all_categories.shape, "periods:", all_periods.shape,
      "foods:", all_foods.shape, "nutrients:", all_nutrients.shape)
print(all_categories)
print(all_periods)
print(all_foods)
print(all_nutrients)

def get_all_categories():
    all_categories.rename(columns={'restaurant_id': 'old_restaurant_id', 'period_id': 'old_period_id', 'category_id': 'old_category_id'}, inplace=True)
    return all_categories

def get_all_periods():
    all_periods.rename(columns={'restaurant_id': 'old_restaurant_id', 'period_id': 'old_period_id'}, inplace=True)
    return all_periods

def get_all_foods():
    all_foods.rename(columns={'restaurant_id': 'old_restaurant_id', 'period_id': 'old_period_id', 'food_id': 'old_food_id', 'category_id': 'old_category_id'}, inplace=True)
    return all_foods

def get_all_nutrients():
    all_nutrients.rename(columns={'food_id': 'old_food_id'}, inplace=True)
    return all_nutrients

print(get_all_foods())