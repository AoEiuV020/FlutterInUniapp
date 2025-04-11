<template>
	<view>
	</view>
</template>

<script lang="uts">
	import FlutterFrameLayout from 'flutter.FlutterFrameLayout';
	import JSCallback from 'com.taobao.weex.bridge.JSCallback';
	import TextUtils from 'android.text.TextUtils';

	// 定义组件
	export default {
		// 组件名称
		name: "ao-flutter",

		props: {
			"optionsString": {
				type: String,
				default: ""
			},
		},
		watch: {
			"optionsString": {
				handler(newValue : string, oldValue : string) {
					if (!this.inited) {
						this.inited = true;
						this.$el?.initFlutterFragment(newValue);
					}
				},
				immediate: true // 创建时是否通过此方法更新属性，默认值为false
			},
		},
		// 组件内部变量
		data() {
			return {
				inited: false,
			}
		},

		// 方法实现
		methods: {
			// 发送通知到Flutter
			sendJsonRpc(s : String) {
				console.log("ao-flutter: sendJsonRpc方法被调用");
				this.$el?.sendJsonRpc(s);
			},
			// 注册方法处理器
			registerJsonRpc(callback : JSCallback) {
				console.log("ao-flutter: registerJsonRpc方法被调用");
				this.$el?.registerJsonRpc((p) => {
					callback.invokeAndKeepAlive(p);
				});
			},
			// 注销方法处理器
			unregisterJsonRpc() {
				console.log("ao-flutter: unregisterJsonRpc方法被调用");
				this.$el?.unregisterJsonRpc();
			}
		},

		// 生命周期方法
		created() {
			console.log("ao-flutter: created生命周期");
		},

		NVBeforeLoad() {
			console.log("ao-flutter: NVBeforeLoad生命周期");
		},

		NVLoad() : FlutterFrameLayout {
			console.log("ao-flutter: NVLoad生命周期");

			// 创建自定义的Kotlin实现的FrameLayout
			const flutterView = new FlutterFrameLayout($androidContext!);

			return flutterView;
		},

		NVLoaded() {
			console.log("ao-flutter: NVLoaded生命周期");
		},

		NVLayouted() {
			console.log("ao-flutter: NVLayouted生命周期");
		},

		NVBeforeUnload() {
			console.log("ao-flutter: NVBeforeUnload生命周期");
		},

		NVUnloaded() {
			console.log("ao-flutter: NVUnloaded生命周期");
		},

		unmounted() {
			console.log("ao-flutter: unmounted生命周期");
		}
	}
</script>

<style></style>