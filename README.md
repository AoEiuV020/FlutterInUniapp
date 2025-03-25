# FlutterInUniapp

在uniapp项目中集成Flutter界面的示例项目。

## 项目结构

- 根目录：uniapp项目
  - 包含基本的uniapp项目结构和配置
  - 用于开发和运行混合应用

- `android/`：安卓项目
  - 用于打包自定义基座给uniapp使用
  - 包含自定义插件和模块

- `flutter/`：Flutter项目
  - 用于开发Flutter界面
  - 打包成aar仓库供安卓项目依赖使用

## 依赖关系

1. Flutter项目打包成aar
2. 安卓项目依赖Flutter的aar
3. uniapp项目使用安卓自定义基座运行

## 使用说明

### 开发环境要求

- Android Studio
- Flutter SDK
- HBuilderX

### 构建步骤

1. 构建Flutter AAR：
   ```
   script\build_flutter_aar.bat
   ```

2. 构建Android自定义基座：
   ```
   script\build_android_debug.bat
   ```

3. 在HBuilderX中运行uniapp项目，选择自定义基座运行
