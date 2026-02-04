@echo off
setlocal
echo ========================================
echo Robust Clean Install Tool
echo ========================================
echo.

cd /d "%~dp0"

echo [1/4] Deleting old node_modules (This may take a moment)...
if exist node_modules (
    rd /s /q node_modules
    echo ✅ node_modules deleted.
) else (
    echo ℹ️ node_modules not found (Clean start).
)

echo [2/4] Deleting package-lock.json / yarn.lock...
if exist package-lock.json del package-lock.json
if exist yarn.lock del yarn.lock
echo ✅ Locks deleted.

echo [3/4] Installing dependencies...
echo Trying npm...
call npm install --legacy-peer-deps
if %errorlevel% neq 0 (
    echo ⚠️ npm failed or not found. Trying yarn...
    call yarn install
    if %errorlevel% neq 0 (
        echo ❌ Both npm and yarn failed!
        echo Please ensure you have Node.js and a package manager installed and in your PATH.
        pause
        exit /b 1
    )
)
echo ✅ Dependencies installed.

echo [4/4] Starting Expo (Clearing Cache)...
call npx expo start --clear

pause
