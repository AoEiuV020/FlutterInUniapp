<template>
	<view>
	</view>
</template>

<script lang="uts">
	// 引用 Android 系统库
	import FrameLayout from 'android.widget.FrameLayout';

	// 导入自定义的Kotlin类
	import FlutterFrameLayout from 'flutter.FlutterFrameLayout';

	// 定义组件
	export default {
		// 组件名称
		name: "uts-flutter",

		// 组件事件声明
		emits: ['viewready'],

		// 显式暴露方法
		expose: ['start'],

		// 组件内部变量
		data() {
			return {
			}
		},

		// 方法实现
		methods: {
			// 对外公开的start方法
			start() {
				console.log("UTS-Flutter: start方法被调用");
			}
		},

		// 生命周期方法
		created() {
			console.log("UTS-Flutter: created生命周期");
		},

		NVBeforeLoad() {
			console.log("UTS-Flutter: NVBeforeLoad生命周期");
		},

		NVLoad() : FlutterFrameLayout {
			console.log("UTS-Flutter: NVLoad生命周期");

			// 创建自定义的Kotlin实现的FrameLayout
			const flutterView = new FlutterFrameLayout($androidContext!);

			// 发送准备完成事件
			this.$emit("viewready");

			return flutterView;
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

<style></style>