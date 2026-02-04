@echo off
echo ========================================
echo Starting Hostel Khata Mobile
echo ========================================
echo.
cd /d "%~dp0"
echo Clearing cache and starting Metro bundler...
call npx expo start --clear
pause
