@echo off

:: 设置工作目录为项目根目录
set PROJECT_ROOT=%~dp0..

:: 设置相关路径变量
set ANDROID_DIR=%PROJECT_ROOT%\android
set APK_OUTPUT_DIR=%ANDROID_DIR%\app\build\outputs\apk\debug
set APK_FILE=%APK_OUTPUT_DIR%\app-debug.apk
set TARGET_DIR=%PROJECT_ROOT%\unpackage\debug
set TARGET_APK=%TARGET_DIR%\android_debug.apk

:: 进入android目录
cd /d "%ANDROID_DIR%"

:: 执行gradle命令构建debug APK
call gradlew.bat assembleDebug

:: 检查构建是否成功
if not exist "%APK_FILE%" (
    echo Error: APK file not found at %APK_FILE%
    exit /b 1
)

:: 创建目标目录（如果不存在）
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
)

:: 移动并覆盖APK文件
copy /y "%APK_FILE%" "%TARGET_APK%"

echo Build and copy completed successfully!
echo APK location: %TARGET_APK%