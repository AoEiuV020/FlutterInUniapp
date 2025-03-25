@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..
set PROJECT_ROOT=%CD%

:: 设置相关路径变量
set ANDROID_DIR=%PROJECT_ROOT%\android
set APP_ASSETS_DIR=%ANDROID_DIR%\app\src\main\assets
set DCLOUD_CONTROL=%APP_ASSETS_DIR%\data\dcloud_control.xml
set APK_OUTPUT_DIR=%ANDROID_DIR%\build\.app\outputs\apk\debug
set APK_FILE=%APK_OUTPUT_DIR%\app-debug.apk
set TARGET_DIR=%PROJECT_ROOT%\unpackage\debug
set TARGET_APK=%TARGET_DIR%\android_debug.apk

:: 添加debug属性
powershell -Command "(Get-Content '%DCLOUD_CONTROL%') -replace '<hbuilder>', '<hbuilder debug=\"true\" syncDebug=\"true\">' | Set-Content '%DCLOUD_CONTROL%'"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to modify dcloud_control.xml
    goto error
)

:: 在新窗口中执行gradle命令构建debug APK
cd /d "%ANDROID_DIR%"
echo 正在构建Android自定义基座...
call gradlew.bat :app:assembleDebug
set BUILD_STATUS=%ERRORLEVEL%

:: 恢复dcloud_control.xml
powershell -Command "(Get-Content '%DCLOUD_CONTROL%') -replace '<hbuilder debug=\"true\" syncDebug=\"true\">', '<hbuilder>' | Set-Content '%DCLOUD_CONTROL%'"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to restore dcloud_control.xml
    goto error
)

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

:: 移动并覆盖APK文件
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
