# PowerShell Script untuk Setup Git Repository dan GitHub Actions
# Manufacturing Dashboard - KMI-Production Branch

Write-Host "🚀 Starting Git Repository Setup..." -ForegroundColor Cyan
Write-Host ""

# 1. Check if Git is installed
try {
    $gitVersion = git --version
    Write-Host "✅ Git is installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Git is not installed. Please install Git first." -ForegroundColor Red
    exit 1
}

# 2. Initialize Git repository (if not exists)
if (-not (Test-Path .git)) {
    Write-Host ""
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git repository initialized" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "✅ Git repository already exists" -ForegroundColor Green
}

# 3. Check current branch
$currentBranch = git branch --show-current 2>$null
if (-not $currentBranch) {
    $currentBranch = "main"
}
Write-Host ""
Write-Host "📍 Current branch: $currentBranch" -ForegroundColor Cyan

# 4. Create or checkout KMI-Production branch
Write-Host ""
Write-Host "🌿 Setting up KMI-Production branch..." -ForegroundColor Yellow
$branchExists = git show-ref --verify --quiet refs/heads/KMI-Production 2>$null
if ($branchExists) {
    Write-Host "Branch KMI-Production already exists, checking out..." -ForegroundColor Yellow
    git checkout KMI-Production
} else {
    Write-Host "Creating new branch KMI-Production..." -ForegroundColor Yellow
    git checkout -b KMI-Production
}

Write-Host "✅ On branch KMI-Production" -ForegroundColor Green

# 5. Add all files (if not already committed)
$status = git status --porcelain
if ($status) {
    Write-Host ""
    Write-Host "📝 Staging files..." -ForegroundColor Yellow
    git add .
    
    Write-Host ""
    $commitMsg = Read-Host "Enter commit message (default: 'Setup KMI-Production branch')"
    if ([string]::IsNullOrWhiteSpace($commitMsg)) {
        $commitMsg = "Setup KMI-Production branch"
    }
    
    git commit -m $commitMsg
    Write-Host "✅ Files committed" -ForegroundColor Green
}

# 6. Setup remote repository
Write-Host ""
Write-Host "🔗 Setting up remote repository..." -ForegroundColor Yellow
$repoUrl = Read-Host "Enter GitHub repository URL (e.g., https://github.com/username/repo.git)"

if ([string]::IsNullOrWhiteSpace($repoUrl)) {
    Write-Host "❌ Repository URL is required" -ForegroundColor Red
    exit 1
}

# Remove existing origin if exists
try {
    git remote remove origin 2>$null
} catch {
    # Ignore if origin doesn't exist
}

# Add new origin
git remote add origin $repoUrl
Write-Host "✅ Remote repository added: $repoUrl" -ForegroundColor Green

# 7. Verify remote
Write-Host ""
Write-Host "🔍 Verifying remote..." -ForegroundColor Yellow
git remote -v

# 8. Check if GitHub Actions workflow exists
Write-Host ""
if (Test-Path ".github/workflows/deploy-production.yml") {
    Write-Host "✅ GitHub Actions workflow file exists" -ForegroundColor Green
} else {
    Write-Host "⚠️  GitHub Actions workflow file not found" -ForegroundColor Yellow
    Write-Host "   Make sure .github/workflows/deploy-production.yml exists" -ForegroundColor Yellow
}

# 9. Push to remote
Write-Host ""
$pushConfirm = Read-Host "Push to remote repository? (y/n)"
if ($pushConfirm -eq "y" -or $pushConfirm -eq "Y") {
    Write-Host ""
    Write-Host "📤 Pushing to remote repository..." -ForegroundColor Yellow
    git push -u origin KMI-Production
    Write-Host ""
    Write-Host "✅ Successfully pushed to remote repository!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Skipping push. You can push later with:" -ForegroundColor Yellow
    Write-Host "   git push -u origin KMI-Production" -ForegroundColor Yellow
}

# 10. Summary
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "✨ Setup Complete!" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Summary:" -ForegroundColor Cyan
Write-Host "   Repository: $repoUrl"
Write-Host "   Branch: KMI-Production"
Write-Host "   Workflow: .github/workflows/deploy-production.yml"
Write-Host ""
Write-Host "🔍 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Check GitHub Actions tab in your repository"
Write-Host "   2. Workflow will run automatically on push to KMI-Production"
Write-Host "   3. Or trigger manually via 'Run workflow' button"
Write-Host ""
Write-Host "📚 For more information, see: docs/GIT_SETUP_GUIDE.md"
Write-Host ""
