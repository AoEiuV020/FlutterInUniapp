@echo off
:: 启动Chrome并禁用web安全选项，同时支持传入额外参数
set CHROME_PATH="C:\Program Files\Google\Chrome\Application\chrome.exe"

if not exist %CHROME_PATH% (
    echo Error: Chrome not found at %CHROME_PATH%
    exit /b 1
)

:: 启动Chrome并传递所有参数
%CHROME_PATH% --disable-web-security %*