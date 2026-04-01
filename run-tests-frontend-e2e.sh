#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/Front-end---Testez-et-am-liorez-une-application-existante"

echo "================================================"
echo "  Frontend E2E tests (Cypress + coverage)"
echo "================================================"
echo ""

cd "$FRONTEND_DIR"

echo "  Starting Angular with instrumented build..."
npx ng run etudiant-frontend:serve-coverage &
SERVER_PID=$!

echo "  Waiting for server on port 4200..."
until nc -z localhost 4200 2>/dev/null; do
  sleep 1
done
echo "  Server ready."
echo ""

npx cypress run
CYPRESS_EXIT=$?

echo ""
echo "  Stopping server..."
kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "  Coverage report:"
echo "  $FRONTEND_DIR/coverage/cypress/index.html"
if command -v wslview &>/dev/null && [ -f "$FRONTEND_DIR/coverage/cypress/lcov-report/index.html" ]; then
  wslview "$FRONTEND_DIR/coverage/cypress/lcov-report/index.html"
fi
echo ""

exit $CYPRESS_EXIT
