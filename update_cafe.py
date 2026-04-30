"""
update_cafe.py
==============
カフェの店名（name）を書き換えて GitHub Push → Vercel デプロイURLを取得する

使い方:
    python update_cafe.py --slug cathedral-coffee --title "New Cafe Name"

事前準備:
    pip install gitpython requests python-dotenv
    .env に以下を記載（.env.example 参照）:
        VERCEL_TOKEN, GITHUB_TOKEN, VERCEL_PROJECT_ID, VERCEL_TEAM_ID
"""

import argparse
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from git import Repo

# ── 設定 ──────────────────────────────────────────────────────────────────────
REPO_PATH     = Path(__file__).parent
CAFES_JSON    = REPO_PATH / "lib" / "cafes.json"
GIT_REMOTE    = "demo"
GIT_BRANCH    = "main"
POLL_INTERVAL = 10   # 秒
POLL_TIMEOUT  = 300  # 秒（最大待機時間）

load_dotenv(REPO_PATH / ".env")
VERCEL_TOKEN      = os.environ.get("VERCEL_TOKEN", "")
GITHUB_TOKEN      = os.environ.get("GITHUB_TOKEN", "")
VERCEL_PROJECT_ID = os.environ.get("VERCEL_PROJECT_ID", "")
VERCEL_TEAM_ID    = os.environ.get("VERCEL_TEAM_ID", "")


# ─────────────────────────────────────────────────────────────────────────────
# 1. cafes.json の書き換え
# ─────────────────────────────────────────────────────────────────────────────

def update_cafe_name(slug: str, new_name: str) -> None:
    raw  = CAFES_JSON.read_text(encoding="utf-8")
    data = json.loads(raw)

    if slug not in data:
        available = ", ".join(data.keys())
        raise KeyError(f"スラグ '{slug}' が存在しません。\n利用可能: {available}")

    old_name = data[slug].get("name", "")
    data[slug]["name"] = new_name

    CAFES_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"[replace]  '{old_name}' → '{new_name}'  (slug: {slug})")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Git add / commit / push
# ─────────────────────────────────────────────────────────────────────────────

def git_push(commit_message: str) -> str:
    repo = Repo(REPO_PATH)

    repo.git.add(str(CAFES_JSON))

    if not repo.index.diff("HEAD"):
        print("[git]      変更なし — コミットをスキップします")
        return repo.head.commit.hexsha[:7]

    repo.index.commit(commit_message)
    sha = repo.head.commit.hexsha[:7]
    print(f"[git]      コミット: {commit_message!r}  ({sha})")

    remote = repo.remote(name=GIT_REMOTE)
    if GITHUB_TOKEN:
        auth_url = remote.url.replace("https://", f"https://{GITHUB_TOKEN}@")
        repo.git.push(auth_url, f"HEAD:{GIT_BRANCH}")
    else:
        remote.push(refspec=f"HEAD:{GIT_BRANCH}")

    print(f"[git]      push 完了 → {GIT_REMOTE}/{GIT_BRANCH}")
    return sha


# ─────────────────────────────────────────────────────────────────────────────
# 3. Vercel デプロイ完了を待機してURLを返す
# ─────────────────────────────────────────────────────────────────────────────

def wait_for_deployment(triggered_after: float) -> str:
    if not VERCEL_TOKEN:
        raise ValueError("VERCEL_TOKEN が .env に設定されていません")
    if not VERCEL_PROJECT_ID:
        raise ValueError("VERCEL_PROJECT_ID が .env に設定されていません")

    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    params  = {"projectId": VERCEL_PROJECT_ID, "limit": 5}
    if VERCEL_TEAM_ID:
        params["teamId"] = VERCEL_TEAM_ID

    deadline = time.time() + POLL_TIMEOUT
    print("[vercel]   デプロイ完了を待機中", end="", flush=True)

    while time.time() < deadline:
        resp = requests.get(
            "https://api.vercel.com/v6/deployments",
            headers=headers,
            params=params,
            timeout=15,
        )
        resp.raise_for_status()

        for deploy in resp.json().get("deployments", []):
            if deploy.get("createdAt", 0) / 1000 < triggered_after:
                continue
            state = deploy.get("readyState") or deploy.get("state", "")
            if state == "READY":
                url = "https://" + deploy["url"]
                print(f"\n[vercel]   READY ✅  {url}")
                return url
            if state in ("ERROR", "CANCELED"):
                raise RuntimeError(f"デプロイ失敗（state: {state}）")

        print(".", end="", flush=True)
        time.sleep(POLL_INTERVAL)

    raise TimeoutError(f"{POLL_TIMEOUT}秒以内にデプロイが完了しませんでした")


# ─────────────────────────────────────────────────────────────────────────────
# メイン
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="カフェの店名を書き換えて Vercel に自動デプロイ"
    )
    parser.add_argument("--slug",  required=True, help="カフェのスラグ (例: cathedral-coffee)")
    parser.add_argument("--title", required=True, help="新しい店名 (例: New Cafe Name)")
    args = parser.parse_args()

    print(f"\n=== update_cafe: {args.slug} → '{args.title}' ===\n")

    update_cafe_name(args.slug, args.title)

    push_time  = time.time()
    commit_msg = f"update: {args.slug} → {args.title}"
    git_push(commit_msg)

    live_url = wait_for_deployment(triggered_after=push_time)

    print(f"\n完了!")
    print(f"  ポートフォリオ:  {live_url}")
    print(f"  カフェページ:    {live_url}/{args.slug}\n")


if __name__ == "__main__":
    main()
