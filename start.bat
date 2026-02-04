@echo off
echo ========================================
echo Starting Hostel Khata Mobile App
echo ========================================
echo.
cd /d "%~dp0"
echo Clearing Metro cache...
if exist .expo (
    rmdir /s /q .expo
)
echo.
echo Starting Expo...
npm start
