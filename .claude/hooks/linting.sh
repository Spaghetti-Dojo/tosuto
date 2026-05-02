#!/usr/bin/env bash
set -euo pipefail

FILE=$(jq -r '.tool_input.file_path // .tool_input.path // ""' 2>/dev/null)

case "$FILE" in
  *.php)
    composer cs && composer analysis
    ;;
  *.ts|*.tsx|*.js|*.jsx)
    pnpm lint:scripts
    ;;
  *.scss|*.css)
    pnpm lint:styles
    ;;
esac
