@echo off
echo ========================================
echo ALIGNING VERSIONS (The "Magic Fix")
echo ========================================
echo.
echo This script will ask Expo to automatically pick the 
echo correct versions for all libraries.
echo.
cd /d "%~dp0"

echo Running expo install --fix...
call npx expo install --fix

echo.
echo ========================================
echo VERSIONS ALIGNED!
echo ========================================
echo.
echo Clearing cache and starting...
call npm start -- --tunnel --clear
pause
