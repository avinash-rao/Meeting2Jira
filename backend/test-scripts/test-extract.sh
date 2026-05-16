#!/bin/bash

# Test script for Phase 2 AI Integration (watsonx.ai)
# This script tests all extract endpoints

BASE_URL="http://localhost:3000"
TEST_DATA_DIR="./test-data"

echo "========================================"
echo "Phase 2 Testing - AI Integration"
echo "Using IBM watsonx.ai"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Connection Test
echo -e "${YELLOW}Test 1: Testing watsonx.ai Connection${NC}"
echo "GET $BASE_URL/api/extract/test"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/extract/test)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Connection test passed${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Connection test failed (HTTP $http_code)${NC}"
    echo "$body"
fi
echo ""

# Test 2: Get Info
echo -e "${YELLOW}Test 2: Getting Extraction Info${NC}"
echo "GET $BASE_URL/api/extract/info"
response=$(curl -s -w "\n%{http_code}" $BASE_URL/api/extract/info)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Info endpoint passed${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Info endpoint failed (HTTP $http_code)${NC}"
    echo "$body"
fi
echo ""

# Test 3: Extract Action Items
echo -e "${YELLOW}Test 3: Extracting Action Items${NC}"
echo "POST $BASE_URL/api/extract"
echo "Using: $TEST_DATA_DIR/sample-transcript.json"

if [ ! -f "$TEST_DATA_DIR/sample-transcript.json" ]; then
    echo -e "${RED}✗ Test data file not found${NC}"
    exit 1
fi

response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/extract \
    -H "Content-Type: application/json" \
    -d @$TEST_DATA_DIR/sample-transcript.json)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "200" ]; then
    echo -e "${GREEN}✓ Extraction passed${NC}"
    echo "$body" | jq '.'
    
    # Count extracted items
    item_count=$(echo "$body" | jq '.data.totalCount')
    echo ""
    echo -e "${GREEN}Extracted $item_count action item(s)${NC}"
else
    echo -e "${RED}✗ Extraction failed (HTTP $http_code)${NC}"
    echo "$body"
fi
echo ""

# Test 4: Error Handling - Empty Transcript
echo -e "${YELLOW}Test 4: Testing Error Handling (Empty Transcript)${NC}"
echo "POST $BASE_URL/api/extract (empty entries)"
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/extract \
    -H "Content-Type: application/json" \
    -d '{"speakers":[],"entries":[],"metadata":{}}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Expected 400 error, got HTTP $http_code${NC}"
    echo "$body"
fi
echo ""

# Test 5: Error Handling - Invalid Data
echo -e "${YELLOW}Test 5: Testing Error Handling (Invalid Data)${NC}"
echo "POST $BASE_URL/api/extract (invalid data)"
response=$(curl -s -w "\n%{http_code}" -X POST $BASE_URL/api/extract \
    -H "Content-Type: application/json" \
    -d '{}')
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" = "400" ]; then
    echo -e "${GREEN}✓ Error handling works correctly${NC}"
    echo "$body" | jq '.'
else
    echo -e "${RED}✗ Expected 400 error, got HTTP $http_code${NC}"
    echo "$body"
fi
echo ""

echo "================================"
echo "Testing Complete"
echo "================================"

# Made with Bob