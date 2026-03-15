#!/bin/bash

echo "🚀 Starting Billing Management System..."
echo ""
echo "Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "Starting Flask application..."
echo "Access the app at: http://localhost:5000"
echo "Press Ctrl+C to stop the server"
echo ""

python app.py
