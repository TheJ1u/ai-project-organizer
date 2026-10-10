@echo off
title OmniAI Project Organizer
echo ========================================================
echo   Starting OmniAI Project Organizer...
echo   Cross-AI Dashboard: Claude, ChatGPT, Antigravity, Grok
echo ========================================================
cd /d "%~dp0"

if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo Launching Express server and opening browser at http://localhost:3456...
node server.js --open
pause
