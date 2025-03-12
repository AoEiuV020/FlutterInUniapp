<template>
  <view>
  </view>
</template>

<script lang="uts">
  // 引用 Android 系统库
  import FrameLayout from 'android.widget.FrameLayout';
  
  // 导入自定义的Kotlin类
  import { SimpleFrameLayout } from 'simple.SimpleFrameLayout';

  export default {
    // 组件名称
    name: "uts-flutter",
    
    // 组件事件声明
    emits: ['viewready'],
    
    // 组件内部变量
    data() {
      return {
        flutterView: null as SimpleFrameLayout | null
      }
    },
    
    // 只暴露start方法
    expose: ['start'],
    
    methods: {
      // 对外公开的start方法
      start() {
        console.log("UTS-Flutter: start方法被调用");
        if (this.flutterView) {
          this.flutterView.start();
        }
      }
    },
    
    // 生命周期方法
    created() {
      console.log("UTS-Flutter: created生命周期");
    },
    
    NVBeforeLoad() {
      console.log("UTS-Flutter: NVBeforeLoad生命周期");
    },
    
    NVLoad() : FrameLayout {
      console.log("UTS-Flutter: NVLoad生命周期");
      
      // 创建自定义的Kotlin实现的FrameLayout
      this.flutterView = new SimpleFrameLayout($androidContext!);
      
      // 设置背景颜色（半透明）
      this.flutterView.setBackgroundColor(0x33000000);
      
      // 发送准备完成事件
      this.$emit("viewready");
      
      return this.flutterView;
    },
    
    NVLoaded() {
      console.log("UTS-Flutter: NVLoaded生命周期");
    },
    
    NVLayouted() {
      console.log("UTS-Flutter: NVLayouted生命周期");
    },
    
    NVBeforeUnload() {
      console.log("UTS-Flutter: NVBeforeUnload生命周期");
    },
    
    NVUnloaded() {
      console.log("UTS-Flutter: NVUnloaded生命周期");
    },
    
    unmounted() {
      console.log("UTS-Flutter: unmounted生命周期");
    }
  }
</script>

<style>
</style>