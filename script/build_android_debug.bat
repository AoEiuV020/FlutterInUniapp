@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..
set PROJECT_ROOT=%CD%

:: 设置相关路径变量
set ANDROID_DIR=%PROJECT_ROOT%\android
set APK_OUTPUT_DIR=%ANDROID_DIR%\build\.app\outputs\apk\debug
set APK_FILE=%APK_OUTPUT_DIR%\app-debug.apk
set TARGET_DIR=%PROJECT_ROOT%\unpackage\debug
set TARGET_APK=%TARGET_DIR%\android_debug.apk

:: 在新窗口中执行gradle命令构建debug APK
cd /d "%ANDROID_DIR%"
echo 正在构建Android自定义基座...
start /wait cmd /c gradlew.bat assembleDebug

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

:: 恢复原目录
popd