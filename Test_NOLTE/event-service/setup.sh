#!/bin/bash

# Event Service Quick Start Script

echo "==================================="
echo "Event Service Quick Start"
echo "==================================="
echo ""

# Check if in correct directory
if [ ! -d "server" ] || [ ! -d "client" ]; then
    echo "Error: Please run this script from the event-service root directory"
    exit 1
fi

echo "Step 1: Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install backend dependencies"
    exit 1
fi

echo ""
echo "Step 2: Building backend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build backend"
    exit 1
fi

echo ""
echo "Step 3: Running backend tests..."
npm test
if [ $? -ne 0 ]; then
    echo "Backend tests failed"
    exit 1
fi

echo ""
echo "Step 4: Installing frontend dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install frontend dependencies"
    exit 1
fi

echo ""
echo "Step 5: Building frontend..."
npm run build
if [ $? -ne 0 ]; then
    echo "Failed to build frontend"
    exit 1
fi

echo ""
echo "==================================="
echo "Setup Complete!"
echo "==================================="
echo ""
echo "To start the application:"
echo ""
echo "Terminal 1 (Backend):"
echo "  cd server && npm run dev"
echo ""
echo "Terminal 2 (Frontend):"
echo "  cd client && npm run dev"
echo ""
echo "Then visit:"
echo "  - Public Events: http://localhost:3000"
echo "  - Admin Dashboard: http://localhost:3000/admin"
echo ""
echo "Default admin token: admin-token-123"
echo "==================================="
