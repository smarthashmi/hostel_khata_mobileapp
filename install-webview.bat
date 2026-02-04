@echo off
echo ========================================
echo Installing WebView for Google Auth
echo ========================================
echo.
cd /d "%~dp0"

echo Installing react-native-webview...
call npx expo install react-native-webview
echo.
echo Clearning cache...
call npx expo start --clear

pause
