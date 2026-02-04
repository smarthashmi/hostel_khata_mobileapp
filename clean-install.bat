@echo off
echo ========================================
echo CLEAN INSTALL & FIX (The "Nuclear" Option)
echo ========================================
echo.
cd /d "%~dp0"

echo Step 1: Killing Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Deleting node_modules and cache...
if exist node_modules (
    echo Deleting node_modules...
    rmdir /s /q node_modules
)
if exist .expo (
    echo Deleting .expo cache...
    rmdir /s /q .expo
)
if exist package-lock.json (
    echo Deleting package-lock.json...
    del package-lock.json
)

echo Step 3: Installing dependencies...
echo This will take a few minutes...
echo.
npm install --legacy-peer-deps

echo.
echo ========================================
echo INSTALLATION COMPLETE!
echo ========================================
echo.
echo Now starting the app...
echo.
npm start -- --tunnel --clear

pause
