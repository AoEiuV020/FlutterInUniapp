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

- Android Studio Ladybug Feature Drop | 2024.2.2
- Flutter SDK 3.29.2
- HBuilderX 4.45

### 构建步骤

1. 构建Flutter AAR：
   生成安卓依赖仓库，  
   或者直接复制仓库repo文件夹到./flutter/packages/meeting_module/build/host/outputs/repo
   ```
   script\build_flutter_aar.bat
   ```

2. 更新Flutter仓库路径：
   config.json只能使用绝对路径所以加了个脚本更新一下，
   ```
   script\update_flutter_repo_path.bat
   ```

3. 构建uniapp资源：
   生成打包用的h5资源和插件模块代码，
   脚本里的UNI_APP_ID必须配置成manifest.json实际appid，
   ```
   script\build_uniapp_resources.bat
   ```

4. 构建Android发布版本：
   这里打包出来就已经是完整的安卓app了，
   ```
   script\build_android_release.bat
   ```

5. 构建Android自定义基座：
   这里生成调试包并复制到自定义基座的目录中，供HBuilderX使用，
   ```
   script\build_android_debug.bat
   ```

6. 在HBuilderX中运行uniapp项目，选择自定义基座运行
