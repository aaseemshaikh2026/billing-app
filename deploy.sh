#!/bin/bash

echo "=========================================="
echo "  🚀 BILLING APP - DEPLOYMENT HELPER"
echo "=========================================="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "📦 Step 1: Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Billing Management System with Authentication"
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

echo ""
echo "=========================================="
echo "  📋 NEXT STEPS:"
echo "=========================================="
echo ""
echo "STEP 2: Create GitHub Repository"
echo "  1. Go to: https://github.com/new"
echo "  2. Repository name: billing-management-app"
echo "  3. Make it PRIVATE"
echo "  4. DO NOT initialize with README"
echo "  5. Click 'Create repository'"
echo ""
echo "STEP 3: Push to GitHub"
echo "  Copy and run these commands:"
echo ""
read -p "  Enter your GitHub username: " github_user

if [ -z "$github_user" ]; then
    echo "❌ No username provided"
    echo ""
    echo "Manual commands:"
    echo "  git remote add origin https://github.com/YOUR_USERNAME/billing-management-app.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
else
    echo ""
    echo "  Run these commands:"
    echo "  ----------------------------------------"
    echo "  git remote add origin https://github.com/$github_user/billing-management-app.git"
    echo "  git branch -M main"
    echo "  git push -u origin main"
    echo "  ----------------------------------------"
    echo ""
    read -p "  Push to GitHub now? (y/n): " push_now
    
    if [ "$push_now" = "y" ]; then
        git remote add origin "https://github.com/$github_user/billing-management-app.git" 2>/dev/null || git remote set-url origin "https://github.com/$github_user/billing-management-app.git"
        git branch -M main
        git push -u origin main
        
        if [ $? -eq 0 ]; then
            echo "✅ Successfully pushed to GitHub!"
        else
            echo "⚠️  Push failed. You may need to:"
            echo "     1. Create the repository on GitHub first"
            echo "     2. Use a Personal Access Token instead of password"
            echo "     3. Get token from: https://github.com/settings/tokens"
        fi
    fi
fi

echo ""
echo "=========================================="
echo "  🌐 STEP 4: Deploy on Render.com"
echo "=========================================="
echo ""
echo "1. Go to: https://dashboard.render.com"
echo "2. Click 'New +' → 'Web Service'"
echo "3. Connect your GitHub repository"
echo "4. Configure:"
echo "   - Name: billing-app"
echo "   - Build Command: pip install -r requirements.txt"
echo "   - Start Command: gunicorn app:app"
echo "   - Instance Type: Free"
echo ""
echo "5. Add Environment Variables:"
echo "   - FLASK_ENV = production"
echo "   - SECRET_KEY = $(openssl rand -hex 32)"
echo ""
echo "6. Click 'Create Web Service'"
echo "7. Wait 2-3 minutes for deployment"
echo ""
echo "=========================================="
echo "  ✅ DEPLOYMENT COMPLETE!"
echo "=========================================="
echo ""
echo "Your app will be available at:"
echo "  https://billing-app-xxxx.onrender.com"
echo ""
echo "Default Login:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "⚠️  IMPORTANT: Change password after first login!"
echo ""
echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
echo ""
