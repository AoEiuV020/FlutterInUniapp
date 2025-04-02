#!/bin/bash

# 保存当前目录并进入项目根目录
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)

# 设置相关路径变量
FLUTTER_DIR="$PROJECT_ROOT/flutter/packages/meeting_module"
OUTPUT_DIR="$FLUTTER_DIR/build/host/outputs/repo"

# 进入Flutter目录并执行构建
cd "$FLUTTER_DIR" || exit 1
echo "Building Flutter AAR (Release)..."
flutter build aar --no-debug --no-profile

if [ $? -ne 0 ]; then
    echo "Error: Flutter AAR build failed!"
    exit 1
fi

echo
echo "Build completed successfully!"
echo
echo "Contents of $OUTPUT_DIR:"
ls -1 "$OUTPUT_DIR"