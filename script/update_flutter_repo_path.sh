#!/bin/bash

# 进入项目根目录
cd "$(dirname "$0")/.." || exit 1
PROJECT_ROOT="$(pwd)"

# 设置相关路径变量
FLUTTER_REPO_DIR="$PROJECT_ROOT/flutter/packages/meeting_module/build/host/outputs/repo"
CONFIG_FILE="$PROJECT_ROOT/uni_modules/ao-flutter/utssdk/app-android/config.json"

# 获取仓库的绝对路径
REPO_PATH="$(cd "$FLUTTER_REPO_DIR" 2>/dev/null && pwd)"

if [ -z "$REPO_PATH" ]; then
    echo "Error: Flutter repository path does not exist!"
    exit 1
fi

# 使用sed更新config.json文件
sed -i.bak "s|maven { url rootProject\.file([^)]*) } //repoFlutter|maven { url rootProject.file('$REPO_PATH') } //repoFlutter|" "$CONFIG_FILE"

if [ $? -ne 0 ]; then
    echo "Error: Failed to update config.json!"
    exit 1
fi

echo
echo "Successfully updated Flutter repository path in config.json!"
echo "New path: $REPO_PATH"