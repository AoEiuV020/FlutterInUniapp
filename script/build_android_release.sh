#!/bin/bash

# 保存当前目录并进入项目根目录
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

# 设置相关路径变量
ANDROID_DIR="$PROJECT_ROOT/android"
APK_OUTPUT_DIR="$ANDROID_DIR/build/.app/outputs/apk/release"
APK_FILE="$APK_OUTPUT_DIR/app-release.apk"
TARGET_DIR="$PROJECT_ROOT/unpackage/release"
TARGET_APK="$TARGET_DIR/android_release.apk"

# 进入Android目录并执行构建
cd "$ANDROID_DIR" || exit 1
echo "正在构建Android发行版apk..."
./gradlew :app:assembleRelease
BUILD_STATUS=$?

# 检查构建是否成功
if [ $BUILD_STATUS -ne 0 ]; then
    echo "Error: Build failed with error code $BUILD_STATUS"
    exit 1
fi

# 创建目标目录（如果不存在）
mkdir -p "$TARGET_DIR"
if [ $? -ne 0 ]; then
    echo "Error: Failed to create target directory"
    exit 1
fi

# 复制APK文件
cp -f "$APK_FILE" "$TARGET_APK"
if [ $? -ne 0 ]; then
    echo "Error: Failed to copy APK file"
    exit 1
fi

echo "Build and copy completed successfully!"
echo "APK location: $TARGET_APK"