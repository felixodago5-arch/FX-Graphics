#!/bin/bash

# FX Graphics Portfolio Backend - Start Script

echo ""
echo "=== FX Graphics Portfolio Backend ==="
echo ""
echo "Installing dependencies..."
echo ""

npm install

if [ $? -ne 0 ]; then
    echo ""
    echo "Error: Failed to install dependencies"
    exit 1
fi

echo ""
echo "Dependencies installed successfully!"
echo ""
echo "Starting backend server..."
echo ""
echo "Server will run on: http://localhost:5000"
echo "Admin panel: http://localhost:5000/admin.html"
echo ""
echo "Default login:"
echo "  Username: admin"
echo "  Password: password123"
echo ""
echo "WARNING: Change your password immediately after first login!"
echo ""
echo "Press Ctrl+C to stop the server"
echo "-----------------------------------"
echo ""

node server.js
