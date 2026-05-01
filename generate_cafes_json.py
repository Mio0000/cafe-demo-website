#!/usr/bin/env python3
"""
generate_cafes_json.py
======================
places_db.json からカテゴリが「Cafe」または「カフェ」の店舗のみを抽出し、
lib/cafes.json を生成します。

cafe-search フラット形式（address=文字列、menu=空）と
cafe-website ネスト形式（address=オブジェクト）の両方を自動判別して正規化します。
"""

import hashlib
import json
import re
import unicodedata
from pathlib import Path
from urllib.parse import quote

REPO = Path(__file__).parent
PLACES_DB = REPO / "places_db.json"
CAFES_JSON = REPO / "lib" / "cafes.json"

CAFE_CATEGORIES = {"Cafe", "カフェ"}

HERO_IMAGES = [
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1600&q=80",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=1600&q=80",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=1600&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=1600&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=1600&q=80",
    "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=1600&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=1600&q=80",
    "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=1600&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=1600&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1600&q=80",
    "https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=1600&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=1600&q=80",
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=1600&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=1600&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80",
]

INTERIOR_IMAGES = [
    "https://images.unsplash.com/photo-1445116572660-236099ec97a0?w=800&q=80",
    "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=800&q=80",
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=800&q=80",
    "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800&q=80",
    "https://images.unsplash.com/photo-1534040385115-33dcb3acba5b?w=800&q=80",
    "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=800&q=80",
    "https://images.unsplash.com/photo-1453614512568-c4024d13c247?w=800&q=80",
    "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&q=80",
    "https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800&q=80",
    "https://images.unsplash.com/photo-1525610553991-2bede1a236e2?w=800&q=80",
    "https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800&q=80",
    "https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?w=800&q=80",
    "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&q=80",
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    "https://images.unsplash.com/photo-1470337458703-46ad1756a187?w=800&q=80",
]

DEFAULT_MENU_EN = [
    {
        "title": "Coffee", "icon": "☕",
        "items": [
            {"name": "Espresso",    "desc": "Single origin, bright & clean",  "price": ""},
            {"name": "Flat White",  "desc": "Velvety microfoam, full-bodied", "price": ""},
            {"name": "Oat Latte",   "desc": "Creamy, naturally sweet",         "price": ""},
            {"name": "Cold Brew",   "desc": "12-hour steep, smooth & dark",    "price": ""},
        ],
    },
    {
        "title": "Bites", "icon": "🥐",
        "items": [
            {"name": "Croissant",     "desc": "Freshly baked daily",             "price": ""},
            {"name": "Avocado Toast", "desc": "Smashed avo on sourdough",        "price": ""},
            {"name": "Banana Bread",  "desc": "House-made, with whipped butter", "price": ""},
            {"name": "Seasonal Tart", "desc": "Ask your barista today",          "price": ""},
        ],
    },
]

DEFAULT_MENU_JA = [
    {
        "title": "コーヒー", "icon": "☕",
        "items": [
            {"name": "エスプレッソ",     "desc": "シングルオリジン",           "price": ""},
            {"name": "フラットホワイト", "desc": "なめらかなマイクロフォーム", "price": ""},
            {"name": "アイスコーヒー",   "desc": "12時間コールドブリュー",     "price": ""},
            {"name": "オーツラテ",       "desc": "植物性ミルク使用",           "price": ""},
        ],
    },
    {
        "title": "フード", "icon": "🥐",
        "items": [
            {"name": "クロワッサン",   "desc": "毎朝焼き立て",            "price": ""},
            {"name": "バタートースト", "desc": "厚切りトーストにバター",  "price": ""},
            {"name": "スコーン",       "desc": "クリームとジャム添え",    "price": ""},
            {"name": "本日のケーキ",   "desc": "スタッフにお尋ねください","price": ""},
        ],
    },
]


# ─── ユーティリティ ────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-") or "cafe"


def is_japanese(text: str) -> bool:
    return any("　" <= ch <= "鿿" for ch in text)


def pick_image(slug: str, pool: list) -> str:
    index = int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(pool)
    return pool[index]


def clear_prices(menu: list) -> list:
    for section in menu:
        for item in section.get("items", []):
            item["price"] = ""
    return menu


def parse_address_str(addr_str: str) -> dict:
    """
    "37 Swanston St, Melbourne VIC 3000, Australia"
    → {line1, line2, city, hint}
    """
    parts = [p.strip() for p in addr_str.split(",")]
    return {
        "line1": parts[0] if len(parts) > 0 else addr_str,
        "line2": parts[1] if len(parts) > 1 else "",
        "city":  ", ".join(parts[2:]) if len(parts) > 2 else "",
        "hint":  "",
    }


# ─── 正規化：cafe-search フラット形式 ↔ cafe-website ネスト形式 ────────────────

def normalize_place(place: dict) -> dict:
    """
    places_db.json の1エントリを cafe-website 表示用に正規化する。
    cafe-search フラット形式（address=文字列）と
    cafe-website ネスト形式（address=オブジェクト）の両方に対応。
    """
    name     = place.get("name", "")
    location = place.get("location", "")  # cafe-search 形式の都市名フィールド
    lang     = "ja" if is_japanese(name + location + str(place.get("address", ""))) else "en"

    # ── address ──────────────────────────────────────────────────────────────
    raw_addr = place.get("address", {})
    if isinstance(raw_addr, str):
        addr_str = raw_addr
        addr_obj = parse_address_str(raw_addr)
    else:
        addr_obj = raw_addr
        addr_str = ", ".join(filter(None, [
            addr_obj.get("line1", ""),
            addr_obj.get("line2", ""),
            addr_obj.get("city", ""),
        ]))
    place["address"] = addr_obj

    # ── eyebrow ──────────────────────────────────────────────────────────────
    if not place.get("eyebrow"):
        street = addr_obj.get("line1", "")
        area   = location or addr_obj.get("line2", "").split()[0] if addr_obj.get("line2") else ""
        place["eyebrow"] = f"{area} · {street}" if area and street else street or location

    # ── tagline ──────────────────────────────────────────────────────────────
    if not place.get("tagline"):
        place["tagline"] = (
            f"{location}にある、こだわりのカフェ。" if lang == "ja" and location
            else "地域に愛されるカフェ。" if lang == "ja"
            else f"Specialty coffee in {location}." if location
            else "Your neighbourhood specialty coffee."
        )

    # ── menuSubtitle ─────────────────────────────────────────────────────────
    if not place.get("menuSubtitle"):
        place["menuSubtitle"] = (
            "季節の食材とスペシャルティコーヒーで、毎日を少し豊かに。" if lang == "ja"
            else "Seasonal ingredients and specialty coffee, served with care every day."
        )

    # ── hours ────────────────────────────────────────────────────────────────
    if not place.get("hours"):
        place["hours"] = (
            [
                {"days": "月曜〜金曜", "time": "8:00 am – 5:00 pm"},
                {"days": "土・日曜",   "time": "9:00 am – 4:00 pm"},
            ] if lang == "ja" else [
                {"days": "Monday – Friday",   "time": "7:00 am – 4:00 pm"},
                {"days": "Saturday – Sunday", "time": "8:00 am – 3:00 pm"},
            ]
        )

    # ── menu ─────────────────────────────────────────────────────────────────
    if not place.get("menu"):
        place["menu"] = DEFAULT_MENU_JA if lang == "ja" else DEFAULT_MENU_EN

    # ── menuNote ─────────────────────────────────────────────────────────────
    if not place.get("menuNote"):
        place["menuNote"] = (
            "メニューは季節により変更されます。スタッフにお尋ねください。" if lang == "ja"
            else "Menu changes seasonally. Dietary options available — ask your barista."
        )

    # ── reviews ──────────────────────────────────────────────────────────────
    if not place.get("reviews"):
        rating = float(place.get("rating", 4.0))
        count  = place.get("reviewCount", 0)
        place["reviews"] = [{
            "author": "Googleレビュー" if lang == "ja" else "Google Review",
            "text": (
                f"地元で人気のカフェ。{count}件以上のレビューが集まる実力店。コーヒーが絶品でスタッフも親切です。"
                if lang == "ja"
                else f"A popular local with {count}+ reviews. Great coffee and a welcoming atmosphere."
            ),
            "rating": min(5, round(rating)),
        }]

    # ── mapEmbed ─────────────────────────────────────────────────────────────
    if not place.get("mapEmbed") and addr_str:
        place["mapEmbed"] = f"https://maps.google.com/maps?q={quote(addr_str)}&output=embed"

    return place


def ensure_slugs(places: list) -> list:
    """slug がないエントリに name から生成して補完。重複は -2, -3, ... で回避。"""
    seen: set = set()
    for place in places:
        raw = place.get("slug") or slugify(place.get("name", "unknown"))
        slug, n = raw, 2
        while slug in seen:
            slug = f"{raw}-{n}"
            n += 1
        place["slug"] = slug
        seen.add(slug)
    return places


# ─── メイン ───────────────────────────────────────────────────────────────────

def main() -> None:
    if not PLACES_DB.exists():
        raise FileNotFoundError(f"places_db.json が見つかりません: {PLACES_DB}")

    places = json.loads(PLACES_DB.read_text(encoding="utf-8"))

    # ① slug を全エントリに補完
    places = ensure_slugs(places)

    # ② カフェのみ抽出
    cafes = [p for p in places if p.get("category") in CAFE_CATEGORIES]
    print(f"[filter]  {len(places)} 件中 {len(cafes)} 件のカフェを抽出しました")

    output: dict = {}
    skipped = 0

    for place in cafes:
        slug = place["slug"]
        try:
            # ③ フラット形式を含む全フィールドを正規化
            place = normalize_place(place)

            entry = {
                "name":          place["name"],
                "tagline":       place["tagline"],
                "eyebrow":       place["eyebrow"],
                "menuSubtitle":  place["menuSubtitle"],
                "address":       place["address"],
                "phone":         place.get("phone", ""),
                "instagram":     place.get("instagram", None),
                "rating":        place.get("rating", 4.0),
                "hours":         place["hours"],
                "wineNote":      place.get("wineNote", None),
                "menu":          clear_prices(place["menu"]),
                "menuNote":      place["menuNote"],
                "transport":     place.get("transport", []),
                "reviews":       place["reviews"],
                "mapEmbed":      place["mapEmbed"],
                "heroImage":     pick_image(slug, HERO_IMAGES),
                "interiorImage": pick_image(slug + "_interior", INTERIOR_IMAGES),
            }
            output[slug] = entry
            print(f"  ✓  /{slug}")

        except Exception as e:
            skipped += 1
            print(f"  ✗  /{slug}  スキップ ({type(e).__name__}: {e})")

    CAFES_JSON.write_text(
        json.dumps(output, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    summary = f"{len(output)} cafes → {CAFES_JSON.relative_to(REPO)}"
    if skipped:
        summary += f"  ({skipped} 件スキップ)"
    print(f"\n[done]    {summary}")


if __name__ == "__main__":
    main()
