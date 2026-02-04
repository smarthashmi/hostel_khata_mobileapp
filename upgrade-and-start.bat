@echo off
echo ========================================
echo UPGRADING TO EXPO SDK 54
echo ========================================
echo.
echo Step 1: Stopping Metro Bundler...
taskkill /F /IM node.exe 2>nul
timeout /t 2 /nobreak >nul

echo Step 2: Removing old node_modules...
if exist node_modules (
    echo Deleting node_modules folder...
    rmdir /s /q node_modules
)

echo Step 3: Installing SDK 54 dependencies...
echo This will take 2-3 minutes...
echo.
npm install --legacy-peer-deps

echo.
echo ========================================
echo UPGRADE COMPLETE!
echo ========================================
echo.
echo Now starting the app with tunnel mode...
echo.
npm start -- --tunnel

pause
