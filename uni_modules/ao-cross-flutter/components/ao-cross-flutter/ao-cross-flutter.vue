<template>
	<div class="container">
		<ao-flutter v-if="isAndroid" ref="flutterView" class="flutter-view"></ao-flutter>
		<web-view v-else :src="webviewUrl" ref="webView" class="web-view"
			allow="camera;microphone;display-capture;fullscreen"></web-view>
	</div>
</template>

<script>
import {
	LivekitDemoOptions,
	MeetExternalAPI
} from './meeting-external-api.js';

export default {
	name: "ao-cross-flutter",
	props: {
		domain: String,
		options: Object,
	},
	data() {
		const api = new MeetExternalAPI(this.domain, this.options);
		return {
			isAndroid: uni.getSystemInfoSync().platform === "android",
			webviewUrl: api.getIframeUrl(),
			api: api,
		};
	},
	mounted() {
		if (this.isAndroid) {
			const flutterView = this.$refs.flutterView;
			this.api.bind((request) => {
				flutterView.sendJsonRpc(JSON.stringify(request));
			});
			flutterView.registerJsonRpc((data) => {
				console.log('flutterView: ', data);
				if (data && typeof data === 'string') {
					try {
						const jsonData = JSON.parse(data);
						this.api.handleMessage(jsonData);
					} catch (error) {
						console.error('Invalid JSON data:', error);
					}
				}
			});
		} else {
			const webView = this.$refs.webView;
			this.api.bind((request) => {
				console.log('www: ', JSON.stringify(request));
				webView.iframe.contentWindow.postMessage(JSON.stringify(request), '*');
			});
			window.addEventListener("message", (event) => {
				if (!event || !event.data) return;
				try {
					const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
					this.api.handleMessage(data);
				} catch (error) {
					console.error('Invalid message data:', error);
				}
			});
		}
	},
	methods: {

		hangUp() {
			this.api.hangUp();
		},
		setAudioMute(muted) {
			this.api.setAudioMute(muted);
		},
		setVideoMute(muted) {
			this.api.setVideoMute(muted);
		},

		interceptHangUp(listener) {
			this.api.interceptHangUp(listener);
		},
	},
	beforeDestroy() {
		if (this.api) {
			this.api.destroy();
		}
	}
};
</script>

<style>
.container {
	position: relative;
	flex: 1;
}

.flutter-view {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	z-index: 1;
}

.web-view {
	position: absolute;
	left: 0;
	right: 0;
	top: 0;
	bottom: 0;
	width: 100%;
	height: 100vh;
}
</style>