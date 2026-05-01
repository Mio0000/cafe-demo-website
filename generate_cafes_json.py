#!/usr/bin/env python3
"""
generate_cafes_json.py
======================
places_db.json からカテゴリが「Cafe」または「カフェ」の店舗のみを抽出し、
全メニュー価格を空文字にして lib/cafes.json を生成します。

使い方:
    python3 generate_cafes_json.py
"""

import hashlib
import json
import re
import unicodedata
from pathlib import Path

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


def slugify(name: str) -> str:
    """店名 → URL-safe スラグ（run_automation.py と同一ロジック）。"""
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-") or "cafe"


def pick_image(slug: str, pool: list) -> str:
    """スラグのハッシュ値でプールから一意に画像を選ぶ（実行ごとに変わらない）。"""
    index = int(hashlib.md5(slug.encode()).hexdigest(), 16) % len(pool)
    return pool[index]


def clear_prices(menu: list) -> list:
    """全メニューアイテムの price を空文字にする。"""
    for section in menu:
        for item in section.get("items", []):
            item["price"] = ""
    return menu


def ensure_slugs(places: list) -> list:
    """
    全エントリに slug を補完する。
    slug がない場合は name から生成し、重複は -2, -3, ... で回避する。
    """
    seen: set = set()
    for place in places:
        raw_slug = place.get("slug") or ""
        if not raw_slug:
            raw_slug = slugify(place.get("name", "unknown"))

        # 重複回避
        slug = raw_slug
        n = 2
        while slug in seen:
            slug = f"{raw_slug}-{n}"
            n += 1

        place["slug"] = slug
        seen.add(slug)

    return places


def main() -> None:
    if not PLACES_DB.exists():
        raise FileNotFoundError(f"places_db.json が見つかりません: {PLACES_DB}")

    places = json.loads(PLACES_DB.read_text(encoding="utf-8"))

    # ── 全エントリの slug を補完（KeyError 根絶）──────────────────────────────
    places = ensure_slugs(places)

    cafes = [p for p in places if p.get("category") in CAFE_CATEGORIES]
    print(f"[filter]  {len(places)} 件中 {len(cafes)} 件のカフェを抽出しました")

    output: dict = {}
    skipped = 0

    for place in cafes:
        slug = place["slug"]  # ensure_slugs で必ず存在する
        try:
            entry = {
                "name":        place["name"],
                "tagline":     place.get("tagline", ""),
                "eyebrow":     place.get("eyebrow", ""),
                "menuSubtitle": place.get(
                    "menuSubtitle",
                    "Seasonal ingredients and specialty coffee, served with care every day.",
                ),
                "address":     place.get("address", {}),
                "phone":       place.get("phone", ""),
                "instagram":   place.get("instagram", None),
                "rating":      place.get("rating", 4.0),
                "hours":       place.get("hours", []),
                "wineNote":    place.get("wineNote", None),
                "menu":        clear_prices(place.get("menu", [])),
                "menuNote":    place.get("menuNote", ""),
                "transport":   place.get("transport", []),
                "reviews":     place.get("reviews", []),
                "mapEmbed":    place.get("mapEmbed", ""),
                "heroImage":   pick_image(slug, HERO_IMAGES),
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
