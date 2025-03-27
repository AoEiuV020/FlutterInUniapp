@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..
set PROJECT_ROOT=%CD%

:: 设置相关路径变量
set ANDROID_DIR=%PROJECT_ROOT%\android
set APK_OUTPUT_DIR=%ANDROID_DIR%\build\.app\outputs\apk\release
set APK_FILE=%APK_OUTPUT_DIR%\app-release.apk
set TARGET_DIR=%PROJECT_ROOT%\unpackage\release
set TARGET_APK=%TARGET_DIR%\android_release.apk

cd /d "%ANDROID_DIR%"
echo 正在构建Android发行版apk...
call gradlew.bat :app:assembleRelease
set BUILD_STATUS=%ERRORLEVEL%

:: 检查构建是否成功
if %BUILD_STATUS% NEQ 0 (
    echo Error: Build failed with error code %BUILD_STATUS%
    goto error
)

:: 创建目标目录（如果不存在）
if not exist "%TARGET_DIR%" (
    mkdir "%TARGET_DIR%"
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to create target directory
        goto error
    )
)

:: 复制并覆盖APK文件
copy /y "%APK_FILE%" "%TARGET_APK%"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to copy APK file
    goto error
)

echo Build and copy completed successfully!
echo APK location: %TARGET_APK%

:: 恢复原目录
popd
goto eof

:error
popd
exit /b 1

:eof