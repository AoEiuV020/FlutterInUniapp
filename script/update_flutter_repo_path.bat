@echo off

:: 设置工作目录为项目根目录
set PROJECT_ROOT=%~dp0..

:: 设置相关路径变量
set FLUTTER_REPO_DIR=%PROJECT_ROOT%\flutter\build\host\outputs\repo
set CONFIG_FILE=%PROJECT_ROOT%\uni_modules\ao-flutter\utssdk\app-android\config.json

:: 获取仓库的绝对路径并转换为左斜杠
for %%i in ("%FLUTTER_REPO_DIR%") do set REPO_PATH=%%~fi
set REPO_PATH=%REPO_PATH:\=/%

:: 使用PowerShell更新config.json文件
powershell -Command "$content = Get-Content '%CONFIG_FILE%' -Raw; $pattern = 'maven \{ url rootProject\.file\([^)]+\) \} //repoFlutter'; $replacement = 'maven { url rootProject.file(''' + '%REPO_PATH%' + ''') } //repoFlutter'; $newContent = $content -replace $pattern, $replacement; Set-Content -Path '%CONFIG_FILE%' -Value $newContent -NoNewline"

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to update config.json!
    exit /b %ERRORLEVEL%
)

echo.
echo Successfully updated Flutter repository path in config.json!
echo New path: %REPO_PATH%