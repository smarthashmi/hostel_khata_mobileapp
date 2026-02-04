@echo off
echo Starting Expo with Tunnel Mode...
echo This works better for network/firewall issues
echo.
cd /d "%~dp0"
npm start -- --tunnel
