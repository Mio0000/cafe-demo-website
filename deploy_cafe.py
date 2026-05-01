"""
deploy_cafe.py
==============
カフェの店名（title）を書き換えて GitHub Push → Vercel デプロイURLを取得する自動化スクリプト

使い方:
    python deploy_cafe.py --slug cathedral-coffee --title "New Cafe Name"

事前準備:
    1. pip install gitpython requests python-dotenv
    2. .env ファイルに VERCEL_TOKEN と GITHUB_TOKEN を記載（.env.example 参照）
"""

import argparse
import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv
from git import Repo

# ── .env 読み込み ──────────────────────────────────────────────────────────────
load_dotenv(Path(__file__).parent / ".env")

VERCEL_TOKEN  = os.environ.get("VERCEL_TOKEN", "")
GITHUB_TOKEN  = os.environ.get("GITHUB_TOKEN", "")   # git push の認証に使用

# ── プロジェクト設定 ───────────────────────────────────────────────────────────
REPO_PATH         = Path(__file__).parent
CAFES_JSON        = REPO_PATH / "lib" / "cafes.json"
GIT_REMOTE        = "demo"          # git remote add demo https://github.com/Mio0000/cafe-demo-website.git
GIT_BRANCH        = "main"
VERCEL_PROJECT_ID = "prj_0GBUd33CfKPPaFEMPMBoZs3OW2r5"
VERCEL_TEAM_ID    = "team_6iyP8GNBljGDV0A1p6AiX79i"

POLL_INTERVAL = 10   # 秒（Vercel APIポーリング間隔）
POLL_TIMEOUT  = 300  # 秒（最大待機時間）


# ─────────────────────────────────────────────────────────────────────────────
# 1. ファイルの書き換え
# ─────────────────────────────────────────────────────────────────────────────

def update_cafe_title(slug: str, new_title: str) -> None:
    """
    lib/cafes.json の指定スラグの 'name' フィールドを new_title に書き換える。

    Jinja2 テンプレートへの移行を想定してコメントで示す（現在は json.loads/dumps を使用）。
    """
    raw  = CAFES_JSON.read_text(encoding="utf-8")
    data = json.loads(raw)

    if slug not in data:
        raise KeyError(f"スラグ '{slug}' が cafes.json に存在しません")

    old_title = data[slug].get("name", "")
    data[slug]["name"] = new_title

    CAFES_JSON.write_text(
        json.dumps(data, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(f"[replace] '{old_title}' → '{new_title}'  (slug: {slug})")

    # ── Jinja2 方式（将来的に採用する場合のサンプル）──────────────────────────
    # from jinja2 import Template
    # template_path = REPO_PATH / "lib" / "cafes.json.j2"
    # rendered = Template(template_path.read_text()).render(cafes=data)
    # CAFES_JSON.write_text(rendered, encoding="utf-8")


# ─────────────────────────────────────────────────────────────────────────────
# 2. Git 操作の自動化（GitPython）
# ─────────────────────────────────────────────────────────────────────────────

def git_push(commit_message: str) -> str:
    """
    git add . → git commit → git push を実行し、コミット SHA を返す。
    GITHUB_TOKEN が設定されている場合、リモート URL に認証情報を埋め込む。
    """
    repo = Repo(REPO_PATH)

    # ステージング
    repo.git.add(A=True)

    # 差分がなければスキップ
    if not repo.index.diff("HEAD") and not repo.untracked_files:
        print("[git]     変更なし — コミットをスキップします")
        return repo.head.commit.hexsha[:7]

    repo.index.commit(commit_message)
    sha = repo.head.commit.hexsha[:7]
    print(f"[git]     コミット完了: {commit_message!r}  ({sha})")

    # push（GITHUB_TOKEN がある場合は URL に埋め込んで認証）
    remote = repo.remote(name=GIT_REMOTE)
    if GITHUB_TOKEN:
        remote_url = remote.url
        # https://github.com/... → https://<token>@github.com/...
        auth_url = remote_url.replace("https://", f"https://{GITHUB_TOKEN}@")
        with repo.git.custom_environment(GIT_ASKPASS="echo"):
            repo.git.push(auth_url, f"HEAD:{GIT_BRANCH}")
    else:
        remote.push(refspec=f"HEAD:{GIT_BRANCH}")

    print(f"[git]     push 完了 → {GIT_REMOTE}/{GIT_BRANCH}")
    return sha


# ─────────────────────────────────────────────────────────────────────────────
# 3. Vercel API 連携
# ─────────────────────────────────────────────────────────────────────────────

def wait_for_deployment(triggered_after: float) -> str:
    """
    Vercel API をポーリングし、triggered_after（Unix秒）以降に作成された
    最新デプロイの readyState が 'READY' になるまで待機してURLを返す。
    """
    if not VERCEL_TOKEN:
        raise ValueError("VERCEL_TOKEN が .env に設定されていません")

    api_url = "https://api.vercel.com/v6/deployments"
    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    params  = {
        "projectId": VERCEL_PROJECT_ID,
        "teamId":    VERCEL_TEAM_ID,
        "limit":     5,
    }

    deadline = time.time() + POLL_TIMEOUT
    print("[vercel]  デプロイ完了を待機中", end="", flush=True)

    while time.time() < deadline:
        resp = requests.get(api_url, headers=headers, params=params, timeout=15)
        resp.raise_for_status()
        deployments = resp.json().get("deployments", [])

        for deploy in deployments:
            created_at = deploy.get("createdAt", 0) / 1000  # ms → s
            if created_at < triggered_after:
                continue  # push 前のデプロイは無視

            state = deploy.get("readyState") or deploy.get("state", "")
            if state == "READY":
                url = "https://" + deploy["url"]
                print(f"\n[vercel]  READY ✅  {url}")
                return url
            if state in ("ERROR", "CANCELED"):
                raise RuntimeError(f"デプロイが失敗しました（state: {state}）")

        print(".", end="", flush=True)
        time.sleep(POLL_INTERVAL)

    raise TimeoutError(f"{POLL_TIMEOUT}秒以内にデプロイが完了しませんでした")


# ─────────────────────────────────────────────────────────────────────────────
# メイン処理
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    parser = argparse.ArgumentParser(
        description="カフェの店名を書き換えて Vercel にデプロイする"
    )
    parser.add_argument("--slug",  required=True, help="カフェのスラグ（例: cathedral-coffee）")
    parser.add_argument("--title", required=True, help="新しい店名（例: New Cafe Name）")
    args = parser.parse_args()

    print(f"\n=== deploy_cafe: {args.slug} → '{args.title}' ===\n")

    # 1. cafes.json の店名を書き換え
    update_cafe_title(args.slug, args.title)

    # 2. GitHub に push
    push_time = time.time()
    commit_msg = f"update: rename '{args.slug}' → {args.title}"
    git_push(commit_msg)

    # 3. Vercel デプロイ完了を待ってURLを表示
    live_url = wait_for_deployment(triggered_after=push_time)

    print(f"\n🎉  デプロイ完了！")
    print(f"    ポートフォリオ:  {live_url}")
    print(f"    カフェページ:    {live_url}/{args.slug}\n")


if __name__ == "__main__":
    main()
