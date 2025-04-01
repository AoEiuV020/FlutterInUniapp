@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..
set PROJECT_ROOT=%CD%

:: 设置相关路径变量
set ANDROID_DIR=%PROJECT_ROOT%\android
set UNPACKAGE_RESOURCES=%PROJECT_ROOT%\unpackage\resources
set FLUTTER_SRC_DIR=%UNPACKAGE_RESOURCES%\uni_modules\ao-flutter\utssdk\app-android\src
set FLUTTER_DEST_DIR=%ANDROID_DIR%\ao-flutter\src\main\java
set ASSETS_DIR=%ANDROID_DIR%\app\src\main\assets\apps
set UNI_APP_ID=__UNI__94F753A

:: 执行cli命令发布资源
echo 正在发布资源...
:: cli只支持gbk可能导致乱码，这里用powershell处理,
cli publish --platform APP --type appResource --project "%PROJECT_ROOT%" | powershell -Command "& {$reader = New-Object System.IO.StreamReader([System.Console]::OpenStandardInput(), [System.Text.Encoding]::GetEncoding('gbk'));while ($line = $reader.ReadLine()) {Write-Output $line;}$reader.Close();}"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to publish resources!
    goto error
)

:: 删除原有的Kotlin源文件
if exist "%FLUTTER_DEST_DIR%" (
    echo 正在清理旧的Kotlin源文件...
    del /Q "%FLUTTER_DEST_DIR%\*.kt" 2>nul
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to delete old Kotlin files!
        goto error
    )
)

:: 复制新的Kotlin源文件
echo 正在复制新的Kotlin源文件...
xcopy /Y "%FLUTTER_SRC_DIR%\*.kt" "%FLUTTER_DEST_DIR%\"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to copy new Kotlin files!
    goto error
)

:: 删除assets目录下所有__UNI__开头的目录
echo 正在清理旧的资源目录...
for /d %%i in ("%ASSETS_DIR%\__UNI__*") do (
    rmdir "%%i" 2>nul || rd /s /q "%%i"
    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to remove old resource directories!
        goto error
    )
)

:: 创建软链接
echo 正在创建资源软链接...
mklink /j "%ASSETS_DIR%\%UNI_APP_ID%" "%UNPACKAGE_RESOURCES%\%UNI_APP_ID%"
if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to create symbolic link!
    goto error
)

echo 资源同步完成！

:: 恢复原目录
popd
goto eof

:error
popd
exit /b 1

:eof