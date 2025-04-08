<template>
	<div class="container">
		<ao-flutter v-if="isAndroid" ref="flutterView" @viewready="onViewReady" class="flutter-view"></ao-flutter>
		<web-view v-else :src="webviewUrl" class="web-view"></web-view>
	</div>
</template>

<script>
import {
  JSONRPCServerAndClient,
  JSONRPCServer,
  JSONRPCClient,
} from '../../../ao-json-rpc/js_sdk';

export default {
	name: 'ao-cross-flutter',
	props: {
		webviewUrl: {
			type: String,
			default: ''
		}
	},
	data() {
		const server = new JSONRPCServer();
		const client = new JSONRPCClient((request) => {
		console.log('send: ', JSON.stringify(request));
		  try {
			  if (this.isAndroid) {
				 this.$refs.flutterView.sendJsonRpc(JSON.stringify(request));
			  } else {
			  }
		    return Promise.resolve();
		  } catch (error) {
		    return Promise.reject(error);
		  }
		});
		return {
			isAndroid: uni.getSystemInfoSync().platform === 'android',
			serverAndClient: new JSONRPCServerAndClient(server, client),
		}
	},
	mounted() {
		console.log("mounted ", this.$refs.flutterView);
		if (this.isAndroid) {
			this.$refs.flutterView.registerJsonRpc((s) => {
				this.serverAndClient.receiveAndSend(JSON.parse(s));
			});
		} else {
			console.log('receive: ', JSON.stringify(request));	  
		}
	},
	methods: {
		start() {
			this.serverAndClient.notify('setInterceptHangUpEnabled', { enabled: true });
			this.serverAndClient.addMethod('interceptHangUp', () => {
				console.log('interceptHangUp');
				this.serverAndClient.notify('hangUp');
				return {
					intercept: true
				};
			})
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
