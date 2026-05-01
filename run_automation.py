#!/usr/bin/env python3
"""
run_automation.py
=================
places_db.json のカフェを10件ずつ順次 GitHub Push & Vercel デプロイします。
deployed_list.txt で進捗を管理し、二重デプロイを防ぎます。

使い方:
    python3 run_automation.py                # 10件ずつデプロイ
    python3 run_automation.py --batch-size 5 # バッチサイズ変更
    python3 run_automation.py --dry-run      # デプロイなし・確認のみ
    python3 run_automation.py --reset        # deployed_list.txt をリセット

フロー:
    places_db.json (全店舗) → 未デプロイ店舗を10件抽出
    → generate_cafes_json.py → git push demo master
    → Vercel ビルド完了待機 → deployed_list.txt に記録
    → 残りがなくなるまでループ
"""

import argparse
import json
import os
import subprocess
import sys
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

REPO = Path(__file__).parent
PLACES_DB = REPO / "places_db.json"
DEPLOYED_LIST = REPO / "deployed_list.txt"
GENERATE_SCRIPT = REPO / "generate_cafes_json.py"

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
    return [p["slug"] for p in places if p.get("category") in CAFE_CATEGORIES]


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

    # 差分チェック
    diff = _run_cmd(["git", "diff", "--cached", "--quiet"], check=False)
    if diff.returncode == 0:
        print("  [git]  変更なし — コミットをスキップします")
        return False

    _run_cmd(["git", "commit", "-m", commit_message])
    print(f"  [git]  コミット: {commit_message!r}")

    # remote URL を取得して TOKEN 埋め込み
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
    """push 以降に作成されたデプロイが READY になるまでポーリング。"""
    if not VERCEL_TOKEN or not VERCEL_PROJECT_ID:
        print("  [vercel]  トークン未設定 — 90秒待機して続行")
        time.sleep(90)
        return BASE_URL

    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    params = {"projectId": VERCEL_PROJECT_ID, "limit": 5}
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
                created = deploy.get("createdAt", 0) / 1000
                if created < triggered_after:
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
    parser.add_argument("--batch-size", type=int, default=10,     help="バッチサイズ (デフォルト: 10)")
    parser.add_argument("--dry-run",    action="store_true",       help="デプロイせず処理内容のみ確認")
    parser.add_argument("--reset",      action="store_true",       help="deployed_list.txt をリセット")
    args = parser.parse_args()

    if args.reset:
        DEPLOYED_LIST.unlink(missing_ok=True)
        print("[reset]  deployed_list.txt を削除しました")

    all_slugs = get_all_cafe_slugs()
    if not all_slugs:
        print(
            "[error]  places_db.json にカフェが見つかりません。\n"
            "         先に python3 cafe-search.py を実行してください。"
        )
        sys.exit(1)

    deployed = load_deployed()
    remaining = [s for s in all_slugs if s not in deployed]

    total_batches = (len(remaining) + args.batch_size - 1) // args.batch_size

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

        # Step 1: cafes.json を再生成（全カフェ累積）
        print("\n  ▶ generate_cafes_json.py ...")
        run_generate()

        # Step 2: git push demo master
        commit_msg = (
            f"Batch deploy #{batch_num}: "
            + ", ".join(batch[:3])
            + ("..." if len(batch) > 3 else "")
        )
        print(f"\n  ▶ git push {GIT_REMOTE} {GIT_BRANCH} ...")
        push_time = time.time()
        pushed = git_push(commit_msg)

        # Step 3: Vercel ビルド待機（push した場合のみ）
        if pushed:
            print(f"\n  ▶ Vercel ビルド待機 (最大 {POLL_TIMEOUT}s) ...")
            wait_for_deployment(triggered_after=push_time)
        else:
            print("  ▶ 変更なし — Vercel 待機をスキップ")

        # Step 4: deployed_list.txt 更新
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
