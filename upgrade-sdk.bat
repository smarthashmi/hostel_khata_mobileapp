@echo off
echo ========================================
echo Upgrading to Expo SDK 54
echo ========================================
echo.
cd /d "%~dp0"
echo Installing updated dependencies...
echo This may take 2-3 minutes...
echo.
npm install --legacy-peer-deps
echo.
echo ========================================
echo Installation complete!
echo Now run: npm start
echo ========================================
pause
