#!/bin/bash

# 进入项目根目录
cd "$(dirname "$0")/.." || exit 1

# 设置项目根目录和submodule目录
PROJECT_ROOT="$(pwd)"
SUBMODULE_DIR="$PROJECT_ROOT/flutter"

# 获取目标路径的函数
get_target_path() {
    case "$1" in
        "livekit")
            echo "$PROJECT_ROOT/../livekit_meeting"
            ;;
        "meeting")
            echo "$PROJECT_ROOT/../meeting_flutter"
            ;;
        *)
            echo ""
            ;;
    esac
}

# 检查是否提供了分支名参数
if [ -z "$1" ]; then
    echo "Error: Please provide a branch name!"
    echo "Usage: $(basename "$0") <branch>"
    echo "Available branches:"
    git branch
    exit 1
fi

# 设置分支名并获取目标路径
BRANCH="$1"
TARGET_PATH=$(get_target_path "$BRANCH")

# 删除现有的submodule目录软链接
if [ -L "$SUBMODULE_DIR" ]; then
    rm "$SUBMODULE_DIR"
fi

# 切换到指定分支
echo "Switching to $BRANCH branch..."
if ! git checkout "$BRANCH"; then
    echo "Error: Failed to switch branch!"
    exit 1
fi

# 根据目标路径处理submodule和软链接
if [ -n "$TARGET_PATH" ]; then
    # 删除现有的submodule目录或软链接
    if [ -e "$SUBMODULE_DIR" ]; then
        rm -rf "$SUBMODULE_DIR"
    fi

    # 创建软链接
    if ! ln -s "$TARGET_PATH" "$SUBMODULE_DIR"; then
        echo "Error: Failed to create symbolic link!"
        exit 1
    fi
    
    echo "Branch switched and submodules updated successfully!"
else
    echo "Branch switched successfully!"
fi