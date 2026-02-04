@echo off
echo ========================================
echo Cleaning and Installing Dependencies
echo ========================================
echo.
cd /d "%~dp0"

echo 1. Removing node_modules...
rd /s /q node_modules
echo.

echo 2. Removing package-lock.json...
del package-lock.json
echo.

echo 3. Installing dependencies with --legacy-peer-deps...
call npm install --legacy-peer-deps
echo.

echo 4. Starting Expo with clear cache...
call npx expo start --clear
pause
