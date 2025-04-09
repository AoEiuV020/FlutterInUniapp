import { JsonRpcWrapper } from "./json-rpc-wrapper";

export class MeetExternalAPI {
	domain;
	options;
	rpc;
	listeners = new Map();

	constructor(domain, options, ) {
		this.domain = domain;
		this.options = options;
	}

	bind(onSendMessage) {
		this.rpc = new JsonRpcWrapper(onSendMessage);
	}

	getIframeUrl() {
		const {
			serverUrl,
			room,
			name
		} = this.options;
		return `${this.domain}/?autoConnect&serverUrl=${serverUrl}&room=${room}&name=${name}`;
	}

	handleMessage(data) {
		if (this.rpc) {
			this.rpc.handleMessage(data);
		}
	}

	destroy() {
		this.rpc.destroy();
	}

	hangUp() {
		this.rpc.sendRequest("hangUp");
	}

	setAudioMute(muted) {
		this.rpc.sendRequest("setAudioMute", {
			muted
		});
	}

	setVideoMute(muted) {
		this.rpc.sendRequest("setVideoMute", {
			muted
		});
	}

	interceptHangUp(listener) {
		this.rpc.sendRequest("setInterceptHangUpEnabled", {
			enabled: true
		});
		this.rpc.registerMethod("interceptHangUp", () => Promise.resolve(listener()).then(result => ({
			intercept: result
		})));
	}

	// 封装 addListener 方法
	addListener(event, listener) {
		// 获取当前 event 对应的监听器集合
		if (!this.listeners.has(event)) {
			this.listeners.set(event, new Set());
		}
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.add(listener);
			// 只有第一次添加监听器时，才调用 registerMethod 来注册
			if (eventListeners.size === 1) {
				this.rpc.registerMethod(event, this.createHandler(event));
			}
		}
	}

	// 封装 removeListener 方法
	removeListener(event, listener) {
		const eventListeners = this.listeners.get(event);
		if (eventListeners) {
			eventListeners.delete(listener);
			// 如果没有监听器了，注销该事件
			if (eventListeners.size === 0) {
				this.rpc.unregisterMethod(event);
			}
		}
	}

	// 内部方法，负责调用所有注册的监听器
	createHandler(event) {
		return (params) => {
			const eventListeners = this.listeners.get(event);
			if (eventListeners) {
				// 执行所有注册的监听器
				eventListeners.forEach((listener) => listener(params));
			}
		};
	}
}

export class LivekitDemoOptions {
	serverUrl;
	room;
	name;
	constructor(serverUrl, room, name) {
		this.serverUrl = serverUrl;
		this.room = room;
		this.name = name;
	}
}