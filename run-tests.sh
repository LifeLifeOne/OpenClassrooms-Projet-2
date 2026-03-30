#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/Back-end---Testez-et-am-liorez-une-application-existante"
FRONTEND_DIR="$SCRIPT_DIR/Front-end---Testez-et-am-liorez-une-application-existante"

BACKEND_OK=false
FRONTEND_OK=false

# Backend tests
echo "================================================"
echo "  Backend tests (Java + JaCoCo)"
echo "================================================"
echo ""

cd "$BACKEND_DIR"
if mvn clean test; then
    BACKEND_OK=true
fi

echo ""

# Frontend tests
echo "================================================"
echo "  Frontend tests (Angular + Jest)"
echo "================================================"
echo ""

cd "$FRONTEND_DIR"
if npx jest --coverage; then
    FRONTEND_OK=true
fi

echo ""

# Results
echo "================================================"
echo "  Results"
echo "================================================"
echo ""

if $BACKEND_OK; then
    echo "  Backend  : PASS"
else
    echo "  Backend  : FAIL"
fi

if $FRONTEND_OK; then
    echo "  Frontend : PASS"
else
    echo "  Frontend : FAIL"
fi

echo ""
echo "  Coverage reports:"
echo "  Backend (JaCoCo) : $BACKEND_DIR/target/site/jacoco/index.html"
echo "  Frontend (Jest)   : $FRONTEND_DIR/coverage/index.html"
echo ""
