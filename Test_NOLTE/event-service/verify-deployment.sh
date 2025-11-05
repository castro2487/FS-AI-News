#!/bin/bash

# Deployment Verification and Testing Script
# This script verifies the Event Service application is production-ready
#
# FIXES APPLIED:
# - Fixed TypeScript type error in server/src/routes/events.ts
# - Added concurrent npm script for easier development
# - Updated package.json with better development workflow

set -e

echo "========================================"
echo "Event Service - Deployment Verification"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test results
TESTS_PASSED=0
TESTS_FAILED=0

# Function to print test result
print_result() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✓ PASS${NC}: $2"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}: $2"
        ((TESTS_FAILED++))
    fi
}

echo "Step 1: Verify Project Structure"
echo "-----------------------------------"

# Check backend files exist
if [ -f "server/src/index.ts" ] && [ -f "server/package.json" ]; then
    print_result 0 "Backend source files present"
else
    print_result 1 "Backend source files missing"
fi

# Check frontend files exist
if [ -f "client/app/page.tsx" ] && [ -f "client/package.json" ]; then
    print_result 0 "Frontend source files present"
else
    print_result 1 "Frontend source files missing"
fi

# Check test files
if [ -f "server/src/tests/api.test.ts" ] && [ -f "client/tests/components.test.tsx" ]; then
    print_result 0 "Test files present"
else
    print_result 1 "Test files missing"
fi

# Check documentation
if [ -f "README.md" ] && [ -f "docs/API.md" ] && [ -f "docs/DEPLOYMENT.md" ]; then
    print_result 0 "Documentation complete"
else
    print_result 1 "Documentation incomplete"
fi

echo ""
echo "Step 2: Install Dependencies"
echo "----------------------------"

cd server
echo "Installing backend dependencies..."
npm install --silent
if [ $? -eq 0 ]; then
    print_result 0 "Backend dependencies installed"
else
    print_result 1 "Backend dependencies installation failed"
fi
cd ..

cd client
echo "Installing frontend dependencies..."
npm install --silent
if [ $? -eq 0 ]; then
    print_result 0 "Frontend dependencies installed"
else
    print_result 1 "Frontend dependencies installation failed"
fi
cd ..

echo ""
echo "Step 3: Run Backend Tests"
echo "------------------------"

cd server
npm test -- --passWithNoTests 2>&1 | tee /tmp/backend-test-results.txt
if [ ${PIPESTATUS[0]} -eq 0 ]; then
    print_result 0 "Backend tests passed"
    echo "Test summary:"
    grep -E "(Test Suites|Tests:|Snapshots)" /tmp/backend-test-results.txt || echo "  Check /tmp/backend-test-results.txt for details"
else
    print_result 1 "Backend tests failed"
    echo "Check /tmp/backend-test-results.txt for details"
fi
cd ..

echo ""
echo "Step 4: Build Production Versions"
echo "--------------------------------"

cd server
echo "Building backend..."
npm run build 2>&1 | tee /tmp/backend-build.txt
if [ ${PIPESTATUS[0]} -eq 0 ] && [ -f "dist/index.js" ]; then
    print_result 0 "Backend build successful"
else
    print_result 1 "Backend build failed"
    echo "Check /tmp/backend-build.txt for details"
fi
cd ..

cd client
echo "Building frontend..."
npm run build 2>&1 | tee /tmp/frontend-build.txt
if [ ${PIPESTATUS[0]} -eq 0 ] && [ -d ".next" ]; then
    print_result 0 "Frontend build successful"
else
    print_result 1 "Frontend build failed"
    echo "Check /tmp/frontend-build.txt for details"
fi
cd ..

echo ""
echo "Step 5: Start Servers for Integration Testing"
echo "---------------------------------------------"

# Start backend
cd server
echo "Starting backend server on port 3001..."
PORT=3001 NODE_ENV=production node dist/index.js > /tmp/backend-server.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to initialize..."
sleep 5

# Check if backend is running
if kill -0 $BACKEND_PID 2>/dev/null; then
    print_result 0 "Backend server started (PID: $BACKEND_PID)"
else
    print_result 1 "Backend server failed to start"
    cat /tmp/backend-server.log
fi

# Test backend health endpoint
echo "Testing backend health endpoint..."
HEALTH_RESPONSE=$(curl -s -w "%{http_code}" http://localhost:3001/health -o /tmp/health-response.txt)
if [ "$HEALTH_RESPONSE" = "200" ]; then
    print_result 0 "Backend health check passed"
    echo "  Response: $(cat /tmp/health-response.txt)"
else
    print_result 1 "Backend health check failed (HTTP $HEALTH_RESPONSE)"
fi

echo ""
echo "Step 6: API Integration Tests"
echo "----------------------------"

# Test: Create event without auth (should fail)
echo "Test 1: Unauthorized request rejection..."
STATUS=$(curl -s -w "%{http_code}" -o /dev/null -X POST http://localhost:3001/events \
    -H "Content-Type: application/json" \
    -d '{"title":"Test"}')
if [ "$STATUS" = "401" ]; then
    print_result 0 "Unauthorized requests properly rejected"
else
    print_result 1 "Authorization not working (got HTTP $STATUS, expected 401)"
fi

# Test: Create event with auth
echo "Test 2: Create event with authentication..."
FUTURE_DATE=$(date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+7d +"%Y-%m-%dT%H:%M:%SZ")
END_DATE=$(date -u -d "+7 days +2 hours" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null || date -u -v+7d -v+2H +"%Y-%m-%dT%H:%M:%SZ")

CREATE_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST http://localhost:3001/events \
    -H "Authorization: Bearer admin-token-123" \
    -H "Content-Type: application/json" \
    -d "{\"title\":\"Test Event\",\"startAt\":\"$FUTURE_DATE\",\"endAt\":\"$END_DATE\",\"location\":\"Test Location\"}")

STATUS=$(echo "$CREATE_RESPONSE" | tail -1)
BODY=$(echo "$CREATE_RESPONSE" | head -n -1)

if [ "$STATUS" = "201" ]; then
    print_result 0 "Event creation successful"
    EVENT_ID=$(echo "$BODY" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
    echo "  Created event ID: $EVENT_ID"
else
    print_result 1 "Event creation failed (HTTP $STATUS)"
fi

# Test: Get public events
echo "Test 3: Retrieve public events..."
STATUS=$(curl -s -w "%{http_code}" -o /tmp/public-events.json http://localhost:3001/public/events)
if [ "$STATUS" = "200" ]; then
    print_result 0 "Public events retrieval successful"
else
    print_result 1 "Public events retrieval failed (HTTP $STATUS)"
fi

# Test: Get event summary (SSE)
if [ -n "$EVENT_ID" ]; then
    echo "Test 4: Event summary streaming..."
    # First, update event to PUBLISHED
    curl -s -X PATCH http://localhost:3001/events/$EVENT_ID \
        -H "Authorization: Bearer admin-token-123" \
        -H "Content-Type: application/json" \
        -d '{"status":"PUBLISHED"}' > /dev/null
    
    # Test SSE endpoint
    timeout 5 curl -s -N http://localhost:3001/public/events/$EVENT_ID/summary > /tmp/summary.txt 2>&1
    if grep -q "data:" /tmp/summary.txt; then
        print_result 0 "Event summary streaming functional"
        echo "  Cache header: $(curl -s -I http://localhost:3001/public/events/$EVENT_ID/summary | grep -i "x-summary-cache" || echo "Not found")"
    else
        print_result 1 "Event summary streaming failed"
    fi
fi

echo ""
echo "Step 7: Cleanup"
echo "--------------"

# Kill backend server
if kill $BACKEND_PID 2>/dev/null; then
    print_result 0 "Backend server stopped"
else
    print_result 1 "Failed to stop backend server"
fi

echo ""
echo "========================================"
echo "Verification Summary"
echo "========================================"
echo -e "${GREEN}Tests Passed: $TESTS_PASSED${NC}"
echo -e "${RED}Tests Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All verification checks passed!${NC}"
    echo "The application is production-ready."
    echo ""
    echo "Next steps:"
    echo "1. Review test logs in /tmp/"
    echo "2. Deploy to production using guides in docs/DEPLOYMENT.md"
    echo "3. Run manual testing on deployed version"
    exit 0
else
    echo -e "${RED}✗ Some verification checks failed.${NC}"
    echo "Please review the errors above and check log files in /tmp/"
    exit 1
fi
