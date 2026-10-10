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

echo Opening browser at http://localhost:3456...
start "" http://localhost:3456

echo Launching Express server on port 3456...
node server.js
pause
