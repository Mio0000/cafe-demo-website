#!/usr/bin/env bash
# deploy-all.sh
# cafes.json 再生成 → git push demo master → Vercel 自動デプロイ
# ※ run_automation.py の「手動ワンショット版」
# 使い方: bash deploy-all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# .env を読み込んで GITHUB_TOKEN を取得
if [ -f .env ]; then
  export $(grep -v '^#' .env | grep -v '^$' | xargs)
fi

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        Cafe Website — Batch Deploy       ║"
echo "║   → cafe-demo-website.vercel.app         ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: cafes.json を再生成 ────────────────────────────────────────────────
echo "▶ Step 1/3  generate_cafes_json.py を実行中..."
python3 generate_cafes_json.py
echo ""

# ── Step 2: git add & commit ───────────────────────────────────────────────────
echo "▶ Step 2/3  git add & commit ..."
git add .

if git diff --cached --quiet; then
  echo "  変更なし — コミットをスキップします"
else
  git commit -m "Batch deploy: New cafe demos"
fi
echo ""

# ── Step 3: git push → demo remote (cafe-demo-website) ────────────────────────
echo "▶ Step 3/3  git push demo master ..."
REMOTE_URL=$(git remote get-url demo)

if [ -n "${GITHUB_TOKEN:-}" ]; then
  AUTH_URL="${REMOTE_URL/https:\/\//https://${GITHUB_TOKEN}@}"
  git push "$AUTH_URL" HEAD:master
else
  git push demo HEAD:master
fi

echo ""
echo "✅  push 完了！Vercel が自動ビルド中..."
echo ""
echo "デプロイ先: https://cafe-demo-website.vercel.app"
echo ""
echo "生成されたカフェページ一覧:"
python3 - <<'PYEOF'
import json
from pathlib import Path
data = json.loads(Path("lib/cafes.json").read_text(encoding="utf-8"))
for slug in data:
    print(f"  https://cafe-demo-website.vercel.app/{slug}")
PYEOF
echo ""
