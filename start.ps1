# OmniAI Project Organizer Startup Script
[CmdletBinding()]
param()

$Host.UI.RawUI.WindowTitle = "OmniAI Project Organizer"
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $scriptDir

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Starting OmniAI Project Organizer..." -ForegroundColor Yellow
Write-Host "  Cross-AI Hub: Claude, ChatGPT, Antigravity, and Grok" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan

if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

Write-Host "Launching server and opening browser at http://localhost:3456..." -ForegroundColor Green
node server.js --open
