@echo off

:: 保存当前目录并进入项目根目录
pushd %~dp0..

:: 设置项目根目录和submodule目录
set PROJECT_ROOT=%CD%
set SUBMODULE_DIR=%PROJECT_ROOT%\flutter

goto start

:: 定义获取目标路径的函数
:get_target_path
if "%~1"=="livekit" (
    set TARGET_PATH=%PROJECT_ROOT%\..\livekit_meeting
) else if "%~1"=="meeting" (
    set TARGET_PATH=%PROJECT_ROOT%\..\meeting_flutter
) else (
    set TARGET_PATH=
)
exit /b

:start
:: 检查是否提供了分支名参数
if "%~1"=="" (
    echo Error: Please provide a branch name!
    echo Usage: %~nx0 ^<branch^>
    echo Available branches:
    git branch
    goto error
)

:: 设置分支名并获取目标路径
set BRANCH=%~1
set TARGET_PATH=
call :get_target_path %BRANCH%

:: 删除现有的submodule目录软链接
if exist %SUBMODULE_DIR% (
    rmdir %SUBMODULE_DIR% 2>nul
)

:: 切换到指定分支
echo Switching to %BRANCH% branch...
git checkout %BRANCH%

if %ERRORLEVEL% NEQ 0 (
    echo Error: Failed to switch branch!
    goto error
)

:: 根据目标路径处理submodule和软链接
if not "%TARGET_PATH%"=="" (

    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to update submodules!
        goto error
    )

    :: 删除现有的submodule目录或软链接
    if exist %SUBMODULE_DIR% (
        rmdir %SUBMODULE_DIR% 2>nul || rmdir /s /q %SUBMODULE_DIR% 2>nul
    )

    :: 创建软链接
    mklink /j %SUBMODULE_DIR% %TARGET_PATH%

    if %ERRORLEVEL% NEQ 0 (
        echo Error: Failed to create symbolic link!
        goto error
    )
    
    echo Branch switched and submodules updated successfully!
) else (
    echo Branch switched successfully!
)

:: 恢复原目录
popd
goto eof

:error
popd
exit /b 1

:eof
