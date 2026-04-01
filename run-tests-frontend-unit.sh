#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/Front-end---Testez-et-am-liorez-une-application-existante"

echo "================================================"
echo "  Frontend unit tests (Angular + Jest)"
echo "================================================"
echo ""

cd "$FRONTEND_DIR"
npx jest --coverage

echo ""
echo "  Coverage report:"
echo "  $FRONTEND_DIR/coverage/jest/index.html"
if command -v wslview &>/dev/null && [ -f "$FRONTEND_DIR/coverage/jest/index.html" ]; then
  wslview "$FRONTEND_DIR/coverage/jest/index.html"
fi
echo ""
