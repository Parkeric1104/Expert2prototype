#!/usr/bin/env bash
# BO 코드 미러 동기화 — src/app/bo 를 Expert2prototype-bo 저장소(main)로 추출 푸시.
# 사용: scripts/sync-bo-mirror.sh  (main 커밋·푸시 후 실행)
set -euo pipefail
cd "$(git rev-parse --show-toplevel)"

MIRROR_URL="git@github.com:Parkeric1104/Expert2prototype-bo.git"
BRANCH="_bo-mirror-tmp"

git branch -D "$BRANCH" 2>/dev/null || true
git subtree split --prefix=src/app/bo -b "$BRANCH" >/dev/null
# 미러는 읽기 전용 — 이력은 split 결과로 항상 덮어씀
git push "$MIRROR_URL" "$BRANCH:main" --force
git branch -D "$BRANCH"
echo "✓ BO 미러 동기화 완료 → https://github.com/Parkeric1104/Expert2prototype-bo"
