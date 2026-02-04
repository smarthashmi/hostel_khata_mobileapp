@echo off
echo ========================================
echo Fixing Reanimated / Worklets Issues
echo ========================================
echo.
cd /d "%~dp0"

echo Installing react-native-worklets-core...
call npm install react-native-worklets-core

echo Reinstalling Reanimated to be safe...
call npx expo install react-native-reanimated

echo Cleaning cache...
call npx expo start --clear

pause
