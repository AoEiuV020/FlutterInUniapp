export const JSONRPC = "2.0";
export const isJSONRPCID = (id) => typeof id === "string" || typeof id === "number" || id === null;
export const isJSONRPCRequest = (payload) => {
    return (payload.jsonrpc === JSONRPC &&
        payload.method !== undefined &&
        payload.result === undefined &&
        payload.error === undefined);
};
export const isJSONRPCRequests = (payload) => {
    return Array.isArray(payload) && payload.every(isJSONRPCRequest);
};
export const isJSONRPCResponse = (payload) => {
    return (payload.jsonrpc === JSONRPC &&
        payload.id !== undefined &&
        (payload.result !== undefined || payload.error !== undefined));
};
export const isJSONRPCResponses = (payload) => {
    return Array.isArray(payload) && payload.every(isJSONRPCResponse);
};
const createJSONRPCError = (code, message, data) => {
    const error = { code, message };
    if (data != null) {
        error.data = data;
    }
    return error;
};
export class JSONRPCErrorException extends Error {
    code;
    data;
    constructor(message, code, data) {
        super(message);
        // Manually set the prototype to fix TypeScript issue:
        // https://github.com/Microsoft/TypeScript-wiki/blob/main/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        Object.setPrototypeOf(this, JSONRPCErrorException.prototype);
        this.code = code;
        this.data = data;
    }
    toObject() {
        return createJSONRPCError(this.code, this.message, this.data);
    }
}
export var JSONRPCErrorCode;
(function (JSONRPCErrorCode) {
    JSONRPCErrorCode[JSONRPCErrorCode["ParseError"] = -32700] = "ParseError";
    JSONRPCErrorCode[JSONRPCErrorCode["InvalidRequest"] = -32600] = "InvalidRequest";
    JSONRPCErrorCode[JSONRPCErrorCode["MethodNotFound"] = -32601] = "MethodNotFound";
    JSONRPCErrorCode[JSONRPCErrorCode["InvalidParams"] = -32602] = "InvalidParams";
    JSONRPCErrorCode[JSONRPCErrorCode["InternalError"] = -32603] = "InternalError";
})(JSONRPCErrorCode || (JSONRPCErrorCode = {}));
export const createJSONRPCErrorResponse = (id, code, message, data) => {
    return {
        jsonrpc: JSONRPC,
        id,
        error: createJSONRPCError(code, message, data),
    };
};
export const createJSONRPCSuccessResponse = (id, result) => {
    return {
        jsonrpc: JSONRPC,
        id,
        result: result ?? null,
    };
};
export const createJSONRPCRequest = (id, method, params) => {
    return {
        jsonrpc: JSONRPC,
        id,
        method,
        params,
    };
};
export const createJSONRPCNotification = (method, params) => {
    return {
        jsonrpc: JSONRPC,
        method,
        params,
    };
};
