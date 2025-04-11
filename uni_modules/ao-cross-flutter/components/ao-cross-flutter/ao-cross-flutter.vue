<template>
	<div class="container">
		<ao-flutter v-if="isAndroid" :optionsString="optionsString" ref="flutterView" class="flutter-view"></ao-flutter>
		<web-view v-else :src="webviewUrl" ref="webView" class="web-view"
			allow="camera;microphone;display-capture;fullscreen"></web-view>
	</div>
</template>

<script>
import { MeetExternalAPI } from "./meeting-external-api.js";

export default {
	name: "ao-cross-flutter",
	props: {
		domain: String,
		options: Object,
	},
	data() {
		const isAndroid = uni.getSystemInfoSync().platform === "android";
		const api = new MeetExternalAPI(this.domain, this.options);
		return {
			isAndroid: isAndroid,
			webviewUrl: api.getIframeUrl(),
			api: api,
			optionsString: JSON.stringify(this.options),
		};
	},
	mounted() {
		if (this.isAndroid) {
			const flutterView = this.$refs.flutterView;
			this.api.bind((request) => {
				const str = JSON.stringify(request);
				console.log("rpc send: ", str);
				flutterView.sendJsonRpc(str);
			});
			flutterView.registerJsonRpc((data) => {
				console.log("rpc receive: ", data);
				if (data && typeof data === "string") {
					try {
						const jsonData = JSON.parse(data);
						this.api.handleMessage(jsonData);
					} catch (error) {
						console.error("Invalid JSON data:", error);
					}
				}
			});
		} else {
			const webView = this.$refs.webView;
			this.api.bind((request) => {
				const str = JSON.stringify(request);
				console.log("rpc send: ", str);
				webView.iframe.contentWindow.postMessage(str, "*");
			});
			window.addEventListener("message", (event) => {
				if (!event || !event.data) return;
				try {
					console.log("rpc receive: ", event.data);
					const data =
						typeof event.data === "string"
							? JSON.parse(event.data)
							: event.data;
					this.api.handleMessage(data);
				} catch (error) {
					console.error("Invalid message data:", error);
				}
			});
		}
	},
	methods: {
		sendRequest(method, params) {
			this.api.sendRequest(method, params);
		},
		sendNotification(method, params) {
			this.api.sendNotification(method, params);
		},
		registerMethod(method, callback) {
			this.api.registerMethod(method, callback);
		},
		unregisterMethod(method) {
			this.api.unregisterMethod(method);
		},
		addListener(method, callback) {
			this.api.addListener(method, callback);
		},
		removeListener(method, callback) {
			this.api.removeListener(method, callback);
		},
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
	},
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
