#!/bin/bash

# Script untuk Setup Git Repository dan GitHub Actions
# Manufacturing Dashboard - KMI-Production Branch

set -e  # Exit on error

echo "🚀 Starting Git Repository Setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check if Git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is installed"

# 2. Initialize Git repository (if not exists)
if [ ! -d .git ]; then
    echo ""
    echo "📦 Initializing Git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo ""
    echo "✅ Git repository already exists"
fi

# 3. Check current branch
CURRENT_BRANCH=$(git branch --show-current 2>/dev/null || echo "main")
echo ""
echo "📍 Current branch: $CURRENT_BRANCH"

# 4. Create or checkout KMI-Production branch
echo ""
echo "🌿 Setting up KMI-Production branch..."
if git show-ref --verify --quiet refs/heads/KMI-Production; then
    echo "Branch KMI-Production already exists, checking out..."
    git checkout KMI-Production
else
    echo "Creating new branch KMI-Production..."
    git checkout -b KMI-Production
fi

echo "✅ On branch KMI-Production"

# 5. Add all files (if not already committed)
if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 Staging files..."
    git add .
    
    echo ""
    read -p "Enter commit message (default: 'Setup KMI-Production branch'): " COMMIT_MSG
    COMMIT_MSG=${COMMIT_MSG:-"Setup KMI-Production branch"}
    
    git commit -m "$COMMIT_MSG"
    echo "✅ Files committed"
fi

# 6. Setup remote repository
echo ""
echo "🔗 Setting up remote repository..."
read -p "Enter GitHub repository URL (e.g., https://github.com/username/repo.git): " REPO_URL

if [ -z "$REPO_URL" ]; then
    echo "❌ Repository URL is required"
    exit 1
fi

# Remove existing origin if exists
git remote remove origin 2>/dev/null || true

# Add new origin
git remote add origin "$REPO_URL"
echo "✅ Remote repository added: $REPO_URL"

# 7. Verify remote
echo ""
echo "🔍 Verifying remote..."
git remote -v

# 8. Check if GitHub Actions workflow exists
echo ""
if [ -f ".github/workflows/deploy-production.yml" ]; then
    echo "✅ GitHub Actions workflow file exists"
else
    echo "⚠️  GitHub Actions workflow file not found"
    echo "   Make sure .github/workflows/deploy-production.yml exists"
fi

# 9. Push to remote
echo ""
read -p "Push to remote repository? (y/n): " PUSH_CONFIRM
if [[ $PUSH_CONFIRM =~ ^[Yy]$ ]]; then
    echo ""
    echo "📤 Pushing to remote repository..."
    git push -u origin KMI-Production
    echo ""
    echo "${GREEN}✅ Successfully pushed to remote repository!${NC}"
else
    echo ""
    echo "${YELLOW}⚠️  Skipping push. You can push later with:${NC}"
    echo "   git push -u origin KMI-Production"
fi

# 10. Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "${GREEN}✨ Setup Complete!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📋 Summary:"
echo "   Repository: $REPO_URL"
echo "   Branch: KMI-Production"
echo "   Workflow: .github/workflows/deploy-production.yml"
echo ""
echo "🔍 Next Steps:"
echo "   1. Check GitHub Actions tab in your repository"
echo "   2. Workflow will run automatically on push to KMI-Production"
echo "   3. Or trigger manually via 'Run workflow' button"
echo ""
echo "📚 For more information, see: docs/GIT_SETUP_GUIDE.md"
echo ""
