import { createJSONRPCErrorResponse, createJSONRPCRequest, createJSONRPCNotification, JSONRPCErrorException, } from "./models";
import { DefaultErrorCode } from "./internal";
export class JSONRPCClient {
    _send;
    createID;
    idToResolveMap;
    id;
    constructor(_send, createID) {
        this._send = _send;
        this.createID = createID;
        this.idToResolveMap = new Map();
        this.id = 0;
    }
    _createID() {
        if (this.createID) {
            return this.createID();
        }
        else {
            return ++this.id;
        }
    }
    timeout(delay, overrideCreateJSONRPCErrorResponse = (id) => createJSONRPCErrorResponse(id, DefaultErrorCode, "Request timeout")) {
        const timeoutRequest = (ids, request) => {
            const timeoutID = setTimeout(() => {
                ids.forEach((id) => {
                    const resolve = this.idToResolveMap.get(id);
                    if (resolve) {
                        this.idToResolveMap.delete(id);
                        resolve(overrideCreateJSONRPCErrorResponse(id));
                    }
                });
            }, delay);
            return request().then((result) => {
                clearTimeout(timeoutID);
                return result;
            }, (error) => {
                clearTimeout(timeoutID);
                return Promise.reject(error);
            });
        };
        const requestAdvanced = (request, clientParams) => {
            const ids = (!Array.isArray(request) ? [request] : request)
                .map((request) => request.id)
                .filter(isDefinedAndNonNull);
            return timeoutRequest(ids, () => this.requestAdvanced(request, clientParams));
        };
        return {
            request: (method, params, clientParams) => {
                const id = this._createID();
                return timeoutRequest([id], () => this.requestWithID(method, params, clientParams, id));
            },
            requestAdvanced: (request, clientParams) => requestAdvanced(request, clientParams),
        };
    }
    request(method, params, clientParams) {
        return this.requestWithID(method, params, clientParams, this._createID());
    }
    async requestWithID(method, params, clientParams, id) {
        const request = createJSONRPCRequest(id, method, params);
        const response = await this.requestAdvanced(request, clientParams);
        if (response.result !== undefined && !response.error) {
            return response.result;
        }
        else if (response.result === undefined && response.error) {
            return Promise.reject(new JSONRPCErrorException(response.error.message, response.error.code, response.error.data));
        }
        else {
            return Promise.reject(new Error("An unexpected error occurred"));
        }
    }
    requestAdvanced(requests, clientParams) {
        const areRequestsOriginallyArray = Array.isArray(requests);
        if (!Array.isArray(requests)) {
            requests = [requests];
        }
        const requestsWithID = requests.filter((request) => isDefinedAndNonNull(request.id));
        const promises = requestsWithID.map((request) => new Promise((resolve) => this.idToResolveMap.set(request.id, resolve)));
        const promise = Promise.all(promises).then((responses) => {
            if (areRequestsOriginallyArray || !responses.length) {
                return responses;
            }
            else {
                return responses[0];
            }
        });
        return this.send(areRequestsOriginallyArray ? requests : requests[0], clientParams).then(() => promise, (error) => {
            requestsWithID.forEach((request) => {
                this.receive(createJSONRPCErrorResponse(request.id, DefaultErrorCode, (error && error.message) || "Failed to send a request"));
            });
            return promise;
        });
    }
    notify(method, params, clientParams) {
        const request = createJSONRPCNotification(method, params);
        this.send(request, clientParams).then(undefined, () => undefined);
    }
    async send(payload, clientParams) {
        return this._send(payload, clientParams);
    }
    rejectAllPendingRequests(message) {
        this.idToResolveMap.forEach((resolve, id) => resolve(createJSONRPCErrorResponse(id, DefaultErrorCode, message)));
        this.idToResolveMap.clear();
    }
    receive(responses) {
        if (!Array.isArray(responses)) {
            responses = [responses];
        }
        responses.forEach((response) => {
            const resolve = this.idToResolveMap.get(response.id);
            if (resolve) {
                this.idToResolveMap.delete(response.id);
                resolve(response);
            }
        });
    }
}
const isDefinedAndNonNull = (value) => value !== undefined && value !== null;
