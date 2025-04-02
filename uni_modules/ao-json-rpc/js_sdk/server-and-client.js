import { isJSONRPCRequest, isJSONRPCRequests, isJSONRPCResponse, isJSONRPCResponses, } from "./models";
export class JSONRPCServerAndClient {
    server;
    client;
    errorListener;
    constructor(server, client, options = {}) {
        this.server = server;
        this.client = client;
        this.errorListener = options.errorListener ?? console.warn;
    }
    applyServerMiddleware(...middlewares) {
        this.server.applyMiddleware(...middlewares);
    }
    hasMethod(name) {
        return this.server.hasMethod(name);
    }
    addMethod(name, method) {
        this.server.addMethod(name, method);
    }
    addMethodAdvanced(name, method) {
        this.server.addMethodAdvanced(name, method);
    }
    removeMethod(name) {
        this.server.removeMethod(name);
    }
    timeout(delay) {
        return this.client.timeout(delay);
    }
    request(method, params, clientParams) {
        return this.client.request(method, params, clientParams);
    }
    requestAdvanced(jsonRPCRequest, clientParams) {
        return this.client.requestAdvanced(jsonRPCRequest, clientParams);
    }
    notify(method, params, clientParams) {
        this.client.notify(method, params, clientParams);
    }
    rejectAllPendingRequests(message) {
        this.client.rejectAllPendingRequests(message);
    }
    async receiveAndSend(payload, serverParams, clientParams) {
        if (isJSONRPCResponse(payload) || isJSONRPCResponses(payload)) {
            this.client.receive(payload);
        }
        else if (isJSONRPCRequest(payload) || isJSONRPCRequests(payload)) {
            const response = await this.server.receive(payload, serverParams);
            if (response) {
                return this.client.send(response, clientParams);
            }
        }
        else {
            const message = "Received an invalid JSON-RPC message";
            this.errorListener(message, payload);
            return Promise.reject(new Error(message));
        }
    }
}
