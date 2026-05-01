#!/usr/bin/env bash
# deploy-all.sh
# ワンコマンドで cafes.json 再生成 → Git push → Vercel 本番デプロイを実行する。
# 使い方: bash deploy-all.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# nvm が管理する node/npm/npx を PATH に追加
export NVM_DIR="${NVM_DIR:-$HOME/.nvm}"
# shellcheck disable=SC1090
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh" --no-use
# 最新バージョンのバイナリを先頭に追加（nvm がない環境ではスキップ）
LATEST_NODE_BIN=$(ls -d "$NVM_DIR/versions/node"/*/bin 2>/dev/null | sort -V | tail -1)
[ -n "$LATEST_NODE_BIN" ] && export PATH="$LATEST_NODE_BIN:$PATH"

echo ""
echo "╔══════════════════════════════════════════╗"
echo "║        Cafe Website — Batch Deploy       ║"
echo "╚══════════════════════════════════════════╝"
echo ""

# ── Step 1: cafes.json を再生成 ────────────────────────────────────────────────
echo "▶ Step 1/4  generate_cafes_json.py を実行中..."
python3 generate_cafes_json.py
echo ""

# ── Step 2: git add ────────────────────────────────────────────────────────────
echo "▶ Step 2/4  git add ..."
git add .
echo ""

# ── Step 3: git commit（変更がない場合はスキップ）─────────────────────────────
echo "▶ Step 3/4  git commit ..."
if git diff --cached --quiet; then
  echo "  変更なし — コミットをスキップします"
else
  git commit -m "Batch deploy: New cafe demos"
  echo ""
  echo "▶ Step 3b/4  git push origin master ..."
  git push origin master
fi
echo ""

# ── Step 4: Vercel 本番デプロイ ────────────────────────────────────────────────
echo "▶ Step 4/4  Vercel 本番デプロイ中..."
npx vercel --prod --yes
echo ""

echo "✅  デプロイ完了！"
echo ""
echo "生成されたカフェページ一覧:"
python3 - <<'PYEOF'
import json
from pathlib import Path

data = json.loads(Path("lib/cafes.json").read_text(encoding="utf-8"))
base = "https://cafe-model.vercel.app"
for slug in data:
    print(f"  {base}/{slug}")
PYEOF
echo ""
