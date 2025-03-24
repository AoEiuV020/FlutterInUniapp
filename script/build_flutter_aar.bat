@echo off

:: 设置工作目录为项目根目录
set PROJECT_ROOT=%~dp0..

:: 设置相关路径变量
set FLUTTER_DIR=%PROJECT_ROOT%\flutter\packages\meeting_module
set OUTPUT_DIR=%FLUTTER_DIR%\build\host\outputs\repo

:: 进入Flutter目录
cd /d "%FLUTTER_DIR%"

echo Building Flutter AAR (Release)...
flutter build aar --no-debug --no-profile

if %ERRORLEVEL% NEQ 0 (
    echo Error: Flutter AAR build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo.
echo Contents of %OUTPUT_DIR%:
dir /b "%OUTPUT_DIR%"