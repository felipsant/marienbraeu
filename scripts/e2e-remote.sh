#!/usr/bin/env bash
# Runs the Playwright suite on the e2e-runner VM (browsers are installed there,
# never on the development box). Usage:
#   scripts/e2e-remote.sh [--fetch-snapshots] [-- <playwright args>]
# Environment: SNAPSHOT_NAME (default "baseline") selects the snapshot set kept on
# the runner; SITE_DIR (default: dist) is the directory served after `npm run build`.
set -euo pipefail

HOST="${E2E_HOST:-claude@192.168.0.109}"
NAME="${SNAPSHOT_NAME:-baseline}"
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REMOTE="mb-e2e/work"
ARGS=""
[ $# -eq 0 ] || ARGS="$(printf '%q ' "$@")"

ssh "$HOST" "mkdir -p $REMOTE mb-e2e/snapshots/$NAME"
rsync -az --delete --exclude node_modules --exclude .git --exclude test-results --exclude 'tests/e2e/.snapshots' \
  "$SRC/" "$HOST:$REMOTE/"
ssh "$HOST" "cd $REMOTE && npm ci --no-audit --no-fund --silent && npm run build --silent && \
  PORT=${PORT:-4173} SITE_DIR='${SITE_DIR:-dist}' SNAPSHOT_DIR=\$HOME/mb-e2e/snapshots/$NAME npx playwright test $ARGS"
