import {
  JSONRPCServerAndClient,
  JSONRPCServer,
  JSONRPCClient,
} from "../../../ao-json-rpc/js_sdk";

export class JsonRpcWrapper {
  constructor(onSendMessage) {
    const server = new JSONRPCServer();
    const client = new JSONRPCClient((request) => {
      try {
        return Promise.resolve(onSendMessage(request));
      } catch (error) {
        return Promise.reject(error);
      }
    });
    this.serverAndClient = new JSONRPCServerAndClient(server, client);
  }

  handleMessage(data) {
    if (data && typeof data === "object" && data.jsonrpc == "2.0") {
      this.serverAndClient.receiveAndSend(data);
    }
  }

  registerMethod(name, handler) {
    this.serverAndClient.addMethod(name, handler);
  }

  unregisterMethod(name) {
    this.serverAndClient.removeMethod(name);
  }

  sendRequest(method, params) {
    return this.serverAndClient.request(method, params);
  }

  sendNotification(method, params) {
    this.serverAndClient.notify(method, params);
  }

  destroy() {
    this.serverAndClient.rejectAllPendingRequests("Connection is closed.");
  }
}
