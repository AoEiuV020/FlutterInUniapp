@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..
set PROJECT_ROOT=%CD%

:: 设置相关路径变量
set FLUTTER_DIR=%PROJECT_ROOT%\flutter
set OUTPUT_DIR=%FLUTTER_DIR%\build\host\outputs\repo

:: 在新窗口中执行flutter命令构建AAR
cd /d "%FLUTTER_DIR%"
echo Building Flutter AAR (Release)...
start /wait cmd /c flutter build aar --no-debug --no-profile

if %ERRORLEVEL% NEQ 0 (
    echo Error: Flutter AAR build failed!
    exit /b %ERRORLEVEL%
)

echo.
echo Build completed successfully!
echo.
echo Contents of %OUTPUT_DIR%:
dir /b "%OUTPUT_DIR%"

:: 恢复原目录
popd