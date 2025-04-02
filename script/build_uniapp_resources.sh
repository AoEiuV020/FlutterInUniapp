#!/bin/bash

# 保存当前目录并进入项目根目录
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

# 设置相关路径变量
ANDROID_DIR="$PROJECT_ROOT/android"
UNPACKAGE_RESOURCES="$PROJECT_ROOT/unpackage/resources"
FLUTTER_SRC_DIR="$UNPACKAGE_RESOURCES/uni_modules/ao-flutter/utssdk/app-android/src"
FLUTTER_DEST_DIR="$ANDROID_DIR/ao-flutter/src/main/java"
ASSETS_DIR="$ANDROID_DIR/app/src/main/assets/apps"
UNI_APP_ID="__UNI__94F753A"

# 执行cli命令发布资源
echo "正在发布资源..."
cli publish --platform APP --type appResource --project "$PROJECT_ROOT"
if [ $? -ne 0 ]; then
    echo "Error: Failed to publish resources!"
    exit 1
fi

# 删除原有的Kotlin源文件
if [ -d "$FLUTTER_DEST_DIR" ]; then
    echo "正在清理旧的Kotlin源文件..."
    rm -f "$FLUTTER_DEST_DIR"/*.kt
    if [ $? -ne 0 ]; then
        echo "Error: Failed to delete old Kotlin files!"
        exit 1
    fi
fi

# 复制新的Kotlin源文件
echo "正在复制新的Kotlin源文件..."
mkdir -p "$FLUTTER_DEST_DIR"
cp -f "$FLUTTER_SRC_DIR"/*.kt "$FLUTTER_DEST_DIR/"
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy new Kotlin files!"
    exit 1
fi

# 删除assets目录下所有__UNI__开头的目录
echo "正在清理旧的资源目录..."
if [ -d "$ASSETS_DIR" ]; then
    find "$ASSETS_DIR" -type d -name "__UNI__*" -exec rm -rf {} +
    if [ $? -ne 0 ]; then
        echo "Error: Failed to remove old resource directories!"
        exit 1
    fi
fi

# 创建软链接
echo "正在创建资源软链接..."
mkdir -p "$ASSETS_DIR"
ln -sfn "$UNPACKAGE_RESOURCES/$UNI_APP_ID" "$ASSETS_DIR/$UNI_APP_ID"
if [ $? -ne 0 ]; then
    echo "Error: Failed to create symbolic link!"
    exit 1
fi

echo "资源同步完成！"