#!/usr/bin/env python3
"""
cafe-search.py
==============
Google Places Text Search API でカフェを検索し、
places_db.json に未登録の店舗を追加します。

使い方:
    python3 cafe-search.py --query "cafe Melbourne CBD" --max 60
    python3 cafe-search.py --query "カフェ 広島市中区" --max 20

必要な環境変数 (.env):
    GOOGLE_PLACES_API_KEY=your_key_here
"""

import argparse
import json
import os
import re
import time
import unicodedata
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

REPO = Path(__file__).parent
PLACES_DB = REPO / "places_db.json"

SEARCH_URL = "https://maps.googleapis.com/maps/api/place/textsearch/json"

DEFAULT_MENU_EN = [
    {
        "title": "Coffee",
        "icon": "☕",
        "items": [
            {"name": "Espresso",    "desc": "Single origin, bright & clean",    "price": ""},
            {"name": "Flat White",  "desc": "Velvety microfoam, full-bodied",   "price": ""},
            {"name": "Oat Latte",   "desc": "Creamy, naturally sweet",           "price": ""},
            {"name": "Cold Brew",   "desc": "12-hour steep, smooth & dark",      "price": ""},
        ],
    },
    {
        "title": "Bites",
        "icon": "🥐",
        "items": [
            {"name": "Croissant",     "desc": "Freshly baked daily",                "price": ""},
            {"name": "Avocado Toast", "desc": "Smashed avo on sourdough",           "price": ""},
            {"name": "Banana Bread",  "desc": "House-made, with whipped butter",    "price": ""},
            {"name": "Seasonal Tart", "desc": "Ask your barista today",             "price": ""},
        ],
    },
]

DEFAULT_MENU_JA = [
    {
        "title": "コーヒー",
        "icon": "☕",
        "items": [
            {"name": "エスプレッソ",     "desc": "シングルオリジン",             "price": ""},
            {"name": "フラットホワイト", "desc": "なめらかなマイクロフォーム",   "price": ""},
            {"name": "アイスコーヒー",   "desc": "12時間コールドブリュー",       "price": ""},
            {"name": "オーツラテ",       "desc": "植物性ミルク使用",             "price": ""},
        ],
    },
    {
        "title": "フード",
        "icon": "🥐",
        "items": [
            {"name": "クロワッサン",     "desc": "毎朝焼き立て",                 "price": ""},
            {"name": "バタートースト",   "desc": "厚切りトーストにバター",       "price": ""},
            {"name": "スコーン",         "desc": "クリームとジャム添え",         "price": ""},
            {"name": "本日のケーキ",     "desc": "スタッフにお尋ねください",     "price": ""},
        ],
    },
]


def slugify(name: str) -> str:
    """店名からURL-safeなスラグを生成する。"""
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-")


def is_japanese(text: str) -> bool:
    return any("　" <= ch <= "鿿" for ch in text)


def parse_address(formatted: str) -> dict:
    parts = [p.strip() for p in formatted.split(",")]
    if len(parts) >= 2:
        return {
            "line1": parts[0],
            "line2": ", ".join(parts[1:3]),
            "city": ", ".join(parts[3:]) if len(parts) > 3 else "",
            "hint": "",
        }
    return {"line1": formatted, "line2": "", "city": "", "hint": ""}


def parse_eyebrow(formatted: str) -> str:
    """住所の1〜2番目の区画を 'Area · Street' 形式で返す。"""
    parts = [p.strip() for p in formatted.split(",")]
    street = parts[0] if parts else ""
    area = parts[1].strip() if len(parts) > 1 else ""
    return f"{area} · {street}" if area else street[:50]


def make_tagline(name: str, vicinity: str, lang: str) -> str:
    area = vicinity.split(",")[0].strip() if vicinity else ""
    if lang == "ja":
        return f"{area}にある、こだわりのコーヒーショップ。" if area else "地域に愛されるカフェ。"
    return f"Specialty coffee in {area}." if area else "Your neighbourhood specialty coffee."


def fetch_places(query: str, api_key: str, max_results: int) -> list:
    results = []
    params = {"query": query, "type": "cafe", "key": api_key}

    while len(results) < max_results:
        resp = requests.get(SEARCH_URL, params=params, timeout=15)
        resp.raise_for_status()
        data = resp.json()

        status = data.get("status", "")
        if status == "ZERO_RESULTS":
            print("[search]  結果がありません")
            break
        if status != "OK":
            print(f"[search]  APIエラー: {status} — {data.get('error_message', '')}")
            break

        batch = data.get("results", [])
        results.extend(batch)
        print(f"[search]  {len(results)} 件取得済み")

        token = data.get("next_page_token")
        if not token or len(results) >= max_results:
            break

        time.sleep(2)  # next_page_token が有効になるまで待機（Google仕様）
        params = {"pagetoken": token, "key": api_key}

    return results[:max_results]


def place_to_entry(place: dict, lang: str) -> dict:
    name = place["name"]
    formatted = place.get("formatted_address", place.get("vicinity", ""))
    vicinity = place.get("vicinity", "")
    rating = float(place.get("rating", 4.0))
    total = place.get("user_ratings_total", 0)

    slug = slugify(name)
    address = parse_address(formatted)
    eyebrow = parse_eyebrow(formatted)
    tagline = make_tagline(name, vicinity, lang)
    menu = DEFAULT_MENU_JA if lang == "ja" else DEFAULT_MENU_EN
    hours = (
        [
            {"days": "月曜〜金曜", "time": "8:00 am – 5:00 pm"},
            {"days": "土・日曜",   "time": "9:00 am – 4:00 pm"},
        ]
        if lang == "ja"
        else [
            {"days": "Monday – Friday",  "time": "7:00 am – 4:00 pm"},
            {"days": "Saturday – Sunday", "time": "8:00 am – 3:00 pm"},
        ]
    )
    review_text = (
        f"地元で人気のカフェ。{total}件以上のレビューが集まる実力店。コーヒーが絶品でスタッフも親切です。"
        if lang == "ja"
        else f"A popular local with {total}+ reviews. Great coffee and a welcoming atmosphere."
    )

    return {
        "slug": slug,
        "category": "カフェ" if lang == "ja" else "Cafe",
        "name": name,
        "tagline": tagline,
        "eyebrow": eyebrow,
        "menuSubtitle": (
            "季節の食材とスペシャルティコーヒーで、毎日を少し豊かに。"
            if lang == "ja"
            else "Seasonal ingredients and specialty coffee, served with care every day."
        ),
        "address": address,
        "phone": "",
        "instagram": None,
        "rating": rating,
        "hours": hours,
        "wineNote": None,
        "menu": menu,
        "menuNote": (
            "メニューは季節により変更されます。スタッフにお尋ねください。"
            if lang == "ja"
            else "Menu changes seasonally. Dietary options available — ask your barista."
        ),
        "transport": [],
        "reviews": [
            {
                "author": "Googleレビュー" if lang == "ja" else "Google Review",
                "text": review_text,
                "rating": min(5, round(rating)),
            }
        ],
        "mapEmbed": f"https://maps.google.com/maps?q={quote(formatted)}&output=embed",
    }


def main() -> None:
    load_dotenv(REPO / ".env")
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY", "")
    if not api_key:
        raise SystemExit(
            "[error]  GOOGLE_PLACES_API_KEY が .env に設定されていません\n"
            "         https://console.cloud.google.com/ でAPIキーを取得してください"
        )

    parser = argparse.ArgumentParser(description="Google Places APIでカフェを検索してplaces_db.jsonに追加")
    parser.add_argument("--query", default="cafe Melbourne CBD", help='検索クエリ (例: "cafe Melbourne CBD")')
    parser.add_argument("--max",   type=int, default=60,          help="最大取得件数 (デフォルト: 60)")
    args = parser.parse_args()

    lang = "ja" if is_japanese(args.query) else "en"
    print(f"\n[search]  クエリ: {args.query!r}  (言語: {lang})")

    # 既存データ読み込み
    existing: list = []
    if PLACES_DB.exists():
        existing = json.loads(PLACES_DB.read_text(encoding="utf-8"))
    existing_slugs = {e["slug"] for e in existing}
    existing_names = {e["name"].lower() for e in existing}

    # Places API 検索
    places = fetch_places(args.query, api_key, args.max)

    added = 0
    for place in places:
        if place["name"].lower() in existing_names:
            continue  # 同名店舗はスキップ

        entry = place_to_entry(place, lang)
        slug = entry["slug"]

        # スラグ重複回避：-2, -3, ... を付与
        base = slug
        n = 2
        while slug in existing_slugs:
            slug = f"{base}-{n}"
            n += 1
        entry["slug"] = slug

        existing.append(entry)
        existing_slugs.add(slug)
        existing_names.add(entry["name"].lower())
        added += 1
        print(f"  + {entry['name']} (★{entry['rating']}) → /{slug}")

    PLACES_DB.write_text(
        json.dumps(existing, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"\n[done]    {added} 件追加  (合計 {len(existing)} 件) → {PLACES_DB.name}")


if __name__ == "__main__":
    main()
