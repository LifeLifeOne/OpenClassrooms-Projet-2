#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Back-end---Testez-et-am-liorez-une-application-existante"

echo "================================================"
echo "  Backend tests (Java + JaCoCo)"
echo "================================================"
echo ""

cd "$BACKEND_DIR"
mvn clean test

echo ""
echo "  Coverage report:"
echo "  $BACKEND_DIR/target/site/jacoco/index.html"
if command -v wslview &>/dev/null && [ -f "$BACKEND_DIR/target/site/jacoco/index.html" ]; then
  wslview "$BACKEND_DIR/target/site/jacoco/index.html"
fi
echo ""
