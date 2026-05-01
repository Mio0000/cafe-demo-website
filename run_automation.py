#!/usr/bin/env python3
"""
run_automation.py
=================
places_db.json のカフェを10件ずつ順次 GitHub Push & Vercel デプロイします。
deployed_list.txt で進捗を管理し、二重デプロイを防ぎます。

使い方:
    python3 run_automation.py                      # 10件ずつデプロイ（自動マージ付き）
    python3 run_automation.py --batch-size 5       # バッチサイズ変更
    python3 run_automation.py --dry-run            # デプロイなし・確認のみ
    python3 run_automation.py --reset              # deployed_list.txt をリセット
    python3 run_automation.py --sync-from PATH     # マージ元を明示指定

フロー:
    [cafe-search/places_db.json] ─自動マージ→ [cafe-website/places_db.json]
    → 未デプロイ10件抽出 → generate_cafes_json.py
    → git push demo master → Vercel ビルド待機 → deployed_list.txt 更新 → ループ
"""

import argparse
import json
import os
import re
import subprocess
import sys
import time
import unicodedata
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

REPO = Path(__file__).parent
PLACES_DB = REPO / "places_db.json"
DEPLOYED_LIST = REPO / "deployed_list.txt"
GENERATE_SCRIPT = REPO / "generate_cafes_json.py"

# cafe-search の places_db.json を自動検出（--sync-from で上書き可）
DEFAULT_SYNC_SOURCE = Path.home() / "claudeProgram" / "cafe-search" / "places_db.json"

CAFE_CATEGORIES = {"Cafe", "カフェ"}
GIT_REMOTE = "demo"
GIT_BRANCH = "master"
BASE_URL = "https://cafe-demo-website.vercel.app"

POLL_INTERVAL = 15   # Vercel APIポーリング間隔（秒）
POLL_TIMEOUT = 360   # デプロイ待機タイムアウト（秒）
BATCH_WAIT = 5       # バッチ間の待機時間（秒）

load_dotenv(REPO / ".env")
VERCEL_TOKEN = os.environ.get("VERCEL_TOKEN", "")
VERCEL_PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")
VERCEL_TEAM_ID = os.environ.get("VERCEL_TEAM_ID", "")
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN", "")


# ─── ユーティリティ ────────────────────────────────────────────────────────────

def slugify(name: str) -> str:
    """店名 → URL-safe スラグ。日本語はASCIIに変換してケバブケース。"""
    name = unicodedata.normalize("NFKD", name)
    name = name.encode("ascii", "ignore").decode("ascii")
    name = name.lower()
    name = re.sub(r"[^a-z0-9\s-]", "", name)
    name = re.sub(r"[\s_]+", "-", name)
    name = re.sub(r"-+", "-", name)
    return name.strip("-")


def is_japanese(text: str) -> bool:
    return any("　" <= ch <= "鿿" for ch in text)


def parse_address_str(addr: str) -> dict:
    """
    "37 Swanston St, Melbourne VIC 3000, Australia"
    → {line1: "37 Swanston St", line2: "Melbourne VIC 3000", city: "Australia", hint: ""}
    """
    parts = [p.strip() for p in addr.split(",")]
    return {
        "line1": parts[0] if len(parts) > 0 else addr,
        "line2": parts[1] if len(parts) > 1 else "",
        "city":  ", ".join(parts[2:]) if len(parts) > 2 else "",
        "hint":  "",
    }


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
            {"name": "クロワッサン",   "desc": "毎朝焼き立て",           "price": ""},
            {"name": "バタートースト", "desc": "厚切りトーストにバター", "price": ""},
            {"name": "スコーン",       "desc": "クリームとジャム添え",   "price": ""},
            {"name": "本日のケーキ",   "desc": "スタッフにお尋ねください","price": ""},
        ],
    },
]


# ─── cafe-search フォーマット → cafe-website フォーマット変換 ─────────────────

def convert_search_entry(entry: dict) -> dict:
    """
    cafe-search の places_db.json エントリ（フラット構造）を
    cafe-website の places_db.json エントリ（ネスト構造）に変換する。

    cafe-search 側フィールド:
        id, name, location, category, rating, reviewCount,
        address (文字列), instagramUrl, mailUrl, contacted
    """
    name      = entry["name"]
    addr_str  = entry.get("address", "")
    location  = entry.get("location", "")
    rating    = float(entry.get("rating", 4.0))
    count     = entry.get("reviewCount", 0)
    lang      = "ja" if is_japanese(name + addr_str + location) else "en"

    street    = addr_str.split(",")[0].strip() if addr_str else ""
    eyebrow   = f"{location} · {street}" if location and street else (location or street)

    if lang == "ja":
        tagline      = f"{location}にある、こだわりのカフェ。" if location else "地域に愛されるカフェ。"
        menu_subtitle = "季節の食材とスペシャルティコーヒーで、毎日を少し豊かに。"
        menu_note    = "メニューは季節により変更されます。スタッフにお尋ねください。"
        review_text  = f"地元で人気のカフェ。{count}件以上のレビューが集まる実力店。コーヒーが絶品でスタッフも親切です。"
        review_auth  = "Googleレビュー"
        hours        = [
            {"days": "月曜〜金曜", "time": "8:00 am – 5:00 pm"},
            {"days": "土・日曜",   "time": "9:00 am – 4:00 pm"},
        ]
        menu = DEFAULT_MENU_JA
        category = "カフェ"
    else:
        tagline      = f"Specialty coffee in {location}." if location else "Your neighbourhood specialty coffee."
        menu_subtitle = "Seasonal ingredients and specialty coffee, served with care every day."
        menu_note    = "Menu changes seasonally. Dietary options available — ask your barista."
        review_text  = f"A popular local with {count}+ reviews. Great coffee and a welcoming atmosphere."
        review_auth  = "Google Review"
        hours        = [
            {"days": "Monday – Friday",   "time": "7:00 am – 4:00 pm"},
            {"days": "Saturday – Sunday", "time": "8:00 am – 3:00 pm"},
        ]
        menu = DEFAULT_MENU_EN
        category = "Cafe"

    return {
        "_source_id": entry.get("id", ""),   # Google Place ID（重複排除に使用）
        "slug":       slugify(name),
        "category":   category,
        "name":       name,
        "tagline":    tagline,
        "eyebrow":    eyebrow,
        "menuSubtitle": menu_subtitle,
        "address":    parse_address_str(addr_str),
        "phone":      "",
        "instagram":  None,
        "rating":     rating,
        "hours":      hours,
        "wineNote":   None,
        "menu":       menu,
        "menuNote":   menu_note,
        "transport":  [],
        "reviews": [
            {
                "author": review_auth,
                "text":   review_text,
                "rating": min(5, round(rating)),
            }
        ],
        "mapEmbed": f"https://maps.google.com/maps?q={quote(addr_str)}&output=embed",
    }


def merge_from_search(source_path: Path) -> int:
    """
    cafe-search の places_db.json（フラット形式）を読み込み、
    cafe-website の places_db.json に未登録エントリを追記する。
    戻り値: 追加件数
    """
    source_entries = json.loads(source_path.read_text(encoding="utf-8"))

    existing: list = []
    if PLACES_DB.exists():
        existing = json.loads(PLACES_DB.read_text(encoding="utf-8"))

    # 重複排除キーセット
    existing_ids   = {e.get("_source_id") for e in existing if e.get("_source_id")}
    existing_names = {e["name"].lower() for e in existing}
    existing_slugs = {e.get("slug") or slugify(e["name"]) for e in existing}

    added = 0
    for raw in source_entries:
        # カフェ以外はスキップ
        if raw.get("category") not in CAFE_CATEGORIES:
            continue

        place_id = raw.get("id", "")

        # Google Place ID が一致 → スキップ
        if place_id and place_id in existing_ids:
            continue
        # 同名店舗 → スキップ
        if raw["name"].lower() in existing_names:
            continue

        entry = convert_search_entry(raw)

        # スラグ重複回避（-2, -3, ...）
        base_slug = entry["slug"]
        slug = base_slug
        n = 2
        while slug in existing_slugs:
            slug = f"{base_slug}-{n}"
            n += 1
        entry["slug"] = slug

        existing.append(entry)
        if place_id:
            existing_ids.add(place_id)
        existing_names.add(raw["name"].lower())
        existing_slugs.add(slug)
        added += 1

    if added > 0:
        PLACES_DB.write_text(
            json.dumps(existing, ensure_ascii=False, indent=2),
            encoding="utf-8",
        )

    return added


# ─── 進捗管理 ─────────────────────────────────────────────────────────────────

def load_deployed() -> set:
    if not DEPLOYED_LIST.exists():
        return set()
    return {
        line.strip()
        for line in DEPLOYED_LIST.read_text(encoding="utf-8").splitlines()
        if line.strip()
    }


def save_deployed(slugs: set) -> None:
    DEPLOYED_LIST.write_text("\n".join(sorted(slugs)) + "\n", encoding="utf-8")


def get_all_cafe_slugs() -> list:
    if not PLACES_DB.exists():
        return []
    places = json.loads(PLACES_DB.read_text(encoding="utf-8"))
    return [
        p.get("slug") or slugify(p["name"])
        for p in places
        if p.get("category") in CAFE_CATEGORIES
    ]


# ─── generate_cafes_json.py 実行 ───────────────────────────────────────────────

def run_generate() -> None:
    result = subprocess.run(
        [sys.executable, str(GENERATE_SCRIPT)],
        capture_output=True, text=True, cwd=REPO,
    )
    if result.returncode != 0:
        raise RuntimeError(f"generate_cafes_json.py 失敗:\n{result.stderr}")
    for line in result.stdout.strip().splitlines():
        print(f"  {line}")


# ─── Git 操作 ──────────────────────────────────────────────────────────────────

def _run_cmd(cmd: list, check=True) -> subprocess.CompletedProcess:
    r = subprocess.run(cmd, capture_output=True, text=True, cwd=REPO)
    if check and r.returncode != 0:
        raise RuntimeError(f"コマンド失敗: {' '.join(cmd)}\n{r.stderr.strip()}")
    return r


def git_push(commit_message: str) -> bool:
    """ステージ → コミット → push。変更がなければ False を返す。"""
    _run_cmd(["git", "add", "-A"])

    diff = _run_cmd(["git", "diff", "--cached", "--quiet"], check=False)
    if diff.returncode == 0:
        print("  [git]  変更なし — コミットをスキップします")
        return False

    _run_cmd(["git", "commit", "-m", commit_message])
    print(f"  [git]  コミット: {commit_message!r}")

    remote_url = _run_cmd(["git", "remote", "get-url", GIT_REMOTE]).stdout.strip()
    if GITHUB_TOKEN:
        auth_url = remote_url.replace("https://", f"https://{GITHUB_TOKEN}@")
        _run_cmd(["git", "push", auth_url, f"HEAD:{GIT_BRANCH}"])
    else:
        _run_cmd(["git", "push", GIT_REMOTE, f"HEAD:{GIT_BRANCH}"])

    print(f"  [git]  push 完了 → {GIT_REMOTE}/{GIT_BRANCH}")
    return True


# ─── Vercel ビルド待機 ────────────────────────────────────────────────────────

def wait_for_deployment(triggered_after: float) -> str:
    if not VERCEL_TOKEN or not VERCEL_PROJECT_ID:
        print("  [vercel]  トークン未設定 — 90秒待機して続行")
        time.sleep(90)
        return BASE_URL

    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    params  = {"projectId": VERCEL_PROJECT_ID, "limit": 5}
    if VERCEL_TEAM_ID:
        params["teamId"] = VERCEL_TEAM_ID

    deadline = time.time() + POLL_TIMEOUT
    print("  [vercel]  ビルド完了を待機中", end="", flush=True)

    while time.time() < deadline:
        try:
            resp = requests.get(
                "https://api.vercel.com/v6/deployments",
                headers=headers, params=params, timeout=15,
            )
            resp.raise_for_status()
            for deploy in resp.json().get("deployments", []):
                if deploy.get("createdAt", 0) / 1000 < triggered_after:
                    continue
                state = deploy.get("readyState") or deploy.get("state", "")
                if state == "READY":
                    url = "https://" + deploy["url"]
                    print(f"\n  [vercel]  READY ✅  {url}")
                    return url
                if state in ("ERROR", "CANCELED"):
                    print(f"\n  [vercel]  デプロイ失敗 (state: {state})")
                    return BASE_URL
        except requests.RequestException as e:
            print(f"\n  [vercel]  API エラー: {e}")

        print(".", end="", flush=True)
        time.sleep(POLL_INTERVAL)

    print(f"\n  [vercel]  タイムアウト ({POLL_TIMEOUT}s)")
    return BASE_URL


# ─── メイン ───────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(description="カフェを10件ずつ自動デプロイ")
    parser.add_argument("--batch-size", type=int, default=10,
                        help="バッチサイズ (デフォルト: 10)")
    parser.add_argument("--dry-run",    action="store_true",
                        help="デプロイせず処理内容のみ確認")
    parser.add_argument("--reset",      action="store_true",
                        help="deployed_list.txt をリセット")
    parser.add_argument("--sync-from",  type=Path, default=None,
                        help=f"マージ元パス (デフォルト: {DEFAULT_SYNC_SOURCE})")
    parser.add_argument("--no-sync",    action="store_true",
                        help="cafe-search からの自動マージをスキップ")
    args = parser.parse_args()

    if args.reset:
        DEPLOYED_LIST.unlink(missing_ok=True)
        print("[reset]  deployed_list.txt を削除しました\n")

    # ── Step 0: cafe-search → cafe-website マージ ────────────────────────────
    if not args.no_sync:
        sync_source = args.sync_from or DEFAULT_SYNC_SOURCE
        if sync_source.exists():
            added = merge_from_search(sync_source)
            if added:
                print(f"[sync]  {sync_source.name} から {added} 件を新規追加しました")
            else:
                print(f"[sync]  {sync_source.name} — 新規エントリなし（スキップ）")
        else:
            if args.sync_from:  # 明示指定なのに見つからない場合だけ警告
                print(f"[sync]  警告: {sync_source} が見つかりません")

    # ── バッチデプロイ ────────────────────────────────────────────────────────
    all_slugs = get_all_cafe_slugs()
    if not all_slugs:
        print(
            "[error]  places_db.json にカフェが見つかりません。\n"
            "         先に python3 cafe-search.py または multi_search.py を実行してください。"
        )
        sys.exit(1)

    deployed = load_deployed()
    remaining = [s for s in all_slugs if s not in deployed]
    total_batches = max(1, (len(remaining) + args.batch_size - 1) // args.batch_size)

    print()
    print("╔══════════════════════════════════════════════╗")
    print("║       Cafe Website — 全自動バッチデプロイ       ║")
    print("╚══════════════════════════════════════════════╝")
    print(f"  全カフェ数    : {len(all_slugs)} 件")
    print(f"  デプロイ済み  : {len(deployed)} 件")
    print(f"  未処理        : {len(remaining)} 件")
    print(f"  バッチサイズ  : {args.batch_size} 件  ({total_batches} バッチ)")
    print(f"  デプロイ先    : {BASE_URL}")
    print(f"  dry-run       : {args.dry_run}")
    print()

    if not remaining:
        print("✅  全カフェ デプロイ済みです！\n")
        print(f"公開URL一覧 ({BASE_URL}):")
        for slug in all_slugs:
            print(f"  ✓ {BASE_URL}/{slug}")
        return

    batch_num = 0
    while remaining:
        batch = remaining[: args.batch_size]
        batch_num += 1

        print(f"{'─'*50}")
        print(f"  バッチ {batch_num}/{total_batches}  ({len(batch)} 件)")
        print(f"{'─'*50}")
        for slug in batch:
            print(f"  • {BASE_URL}/{slug}")

        if args.dry_run:
            print("  [dry-run] スキップ\n")
            remaining = remaining[args.batch_size :]
            continue

        print("\n  ▶ generate_cafes_json.py ...")
        run_generate()

        commit_msg = (
            f"Batch deploy #{batch_num}: "
            + ", ".join(batch[:3])
            + ("..." if len(batch) > 3 else "")
        )
        print(f"\n  ▶ git push {GIT_REMOTE} {GIT_BRANCH} ...")
        push_time = time.time()
        pushed = git_push(commit_msg)

        if pushed:
            print(f"\n  ▶ Vercel ビルド待機 (最大 {POLL_TIMEOUT}s) ...")
            wait_for_deployment(triggered_after=push_time)
        else:
            print("  ▶ 変更なし — Vercel 待機をスキップ")

        deployed.update(batch)
        save_deployed(deployed)
        remaining = remaining[args.batch_size :]

        print(f"\n  ✅  バッチ {batch_num} 完了:")
        for slug in batch:
            print(f"     {BASE_URL}/{slug}")

        if remaining:
            print(f"\n  次のバッチまで {BATCH_WAIT} 秒待機...\n")
            time.sleep(BATCH_WAIT)

    print()
    print("╔══════════════════════════════════════════════╗")
    print(f"║  🎉  全 {len(deployed)} カフェのデプロイ完了！         ║")
    print("╚══════════════════════════════════════════════╝")
    print()
    print(f"公開URL一覧 ({BASE_URL}):")
    for slug in get_all_cafe_slugs():
        print(f"  ✓ {BASE_URL}/{slug}")
    print()


if __name__ == "__main__":
    main()
