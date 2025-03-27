<template>
	<view class="container">
		<ao-flutter v-if="isAndroid" ref="flutterView" @viewready="onViewReady" class="flutter-view"></ao-flutter>
		<web-view v-else :src="webviewUrl" class="web-view"></web-view>
	</view>
</template>

<script>
export default {
	name: 'ao-cross-flutter',
	props: {
		webviewUrl: {
			type: String,
			default: ''
		}
	},
	data() {
		return {
			isAndroid: uni.getSystemInfoSync().platform === 'android'
		}
	},
	methods: {
		start() {
			if (this.isAndroid) {
				this.$refs.flutterView.start();
			} else {
				console.log('在非Android平台使用webview');
			}
		},
		onViewReady() {
			this.$emit('viewready');
		}
	}
}
</script>

<style>
.container {
	position: relative;
	flex: 1;
	width: 100%;
	height: 100vh;
}

.flutter-view,
.web-view {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	width: 100%;
	height: 100%;
}
</style>
