@echo off
echo ========================================
echo FINAL FIX: Nuke Everything & Reinstall
echo ========================================
echo.
cd /d "%~dp0"

echo [1/6] Stopping all Node processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo [2/6] Deleting node_modules...
if exist node_modules (
    rmdir /s /q node_modules
)

echo [3/6] Deleting lock files...
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock

echo [4/6] Deleting Expo cache...
if exist .expo (
    rmdir /s /q .expo
)

echo [5/6] Cleaning NPM cache...
call npm cache clean --force

echo [6/6] Installing dependencies (Legacy Peer Deps)...
echo This will take 3-5 minutes. Please wait...
call npm install --legacy-peer-deps

echo.
echo ========================================
echo REPAIR COMPLETE. Starting App...
echo ========================================
echo.
call npm start -- --tunnel --clear
pause
