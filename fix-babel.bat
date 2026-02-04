@echo off
echo ========================================
echo Fixing Babel Configuration
echo ========================================
echo.
cd /d "%~dp0"
echo Installing react-refresh...
npm install react-refresh --save-dev --legacy-peer-deps
echo.
echo Clearing Metro cache...
if exist .expo (
    rmdir /s /q .expo
)
echo.
echo Starting Expo...
npm start -- --clear
pause
