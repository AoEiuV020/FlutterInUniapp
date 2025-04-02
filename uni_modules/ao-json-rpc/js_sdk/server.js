import { JSONRPCErrorCode, JSONRPCErrorException, createJSONRPCErrorResponse, createJSONRPCSuccessResponse, isJSONRPCRequest, isJSONRPCID, } from "./models";
import { DefaultErrorCode } from "./internal";
const createParseErrorResponse = () => createJSONRPCErrorResponse(null, JSONRPCErrorCode.ParseError, "Parse error");
const createInvalidRequestResponse = (request) => createJSONRPCErrorResponse(isJSONRPCID(request.id) ? request.id : null, JSONRPCErrorCode.InvalidRequest, "Invalid Request");
const createMethodNotFoundResponse = (id) => createJSONRPCErrorResponse(id, JSONRPCErrorCode.MethodNotFound, "Method not found");
export class JSONRPCServer {
    nameToMethodDictionary;
    middleware;
    errorListener;
    mapErrorToJSONRPCErrorResponse = defaultMapErrorToJSONRPCErrorResponse;
    constructor(options = {}) {
        this.nameToMethodDictionary = {};
        this.middleware = null;
        this.errorListener = options.errorListener ?? console.warn;
    }
    hasMethod(name) {
        return !!this.nameToMethodDictionary[name];
    }
    addMethod(name, method) {
        this.addMethodAdvanced(name, this.toJSONRPCMethod(method));
    }
    removeMethod(name) {
        delete this.nameToMethodDictionary[name];
    }
    toJSONRPCMethod(method) {
        return (request, serverParams) => {
            const response = method(request.params, serverParams);
            return Promise.resolve(response).then((result) => mapResultToJSONRPCResponse(request.id, result));
        };
    }
    addMethodAdvanced(name, method) {
        this.nameToMethodDictionary = {
            ...this.nameToMethodDictionary,
            [name]: method,
        };
    }
    receiveJSON(json, serverParams) {
        const request = this.tryParseRequestJSON(json);
        if (request) {
            return this.receive(request, serverParams);
        }
        else {
            return Promise.resolve(createParseErrorResponse());
        }
    }
    tryParseRequestJSON(json) {
        try {
            return JSON.parse(json);
        }
        catch {
            return null;
        }
    }
    receive(request, serverParams) {
        if (Array.isArray(request)) {
            return this.receiveMultiple(request, serverParams);
        }
        else {
            return this.receiveSingle(request, serverParams);
        }
    }
    async receiveMultiple(requests, serverParams) {
        const responses = (await Promise.all(requests.map((request) => this.receiveSingle(request, serverParams)))).filter(isNonNull);
        if (responses.length === 1) {
            return responses[0];
        }
        else if (responses.length) {
            return responses;
        }
        else {
            return null;
        }
    }
    async receiveSingle(request, serverParams) {
        const method = this.nameToMethodDictionary[request.method];
        if (!isJSONRPCRequest(request)) {
            return createInvalidRequestResponse(request);
        }
        else {
            const response = await this.callMethod(method, request, serverParams);
            return mapResponse(request, response);
        }
    }
    applyMiddleware(...middlewares) {
        if (this.middleware) {
            this.middleware = this.combineMiddlewares([
                this.middleware,
                ...middlewares,
            ]);
        }
        else {
            this.middleware = this.combineMiddlewares(middlewares);
        }
    }
    combineMiddlewares(middlewares) {
        if (!middlewares.length) {
            return null;
        }
        else {
            return middlewares.reduce(this.middlewareReducer);
        }
    }
    middlewareReducer(prevMiddleware, nextMiddleware) {
        return (next, request, serverParams) => {
            return prevMiddleware((request, serverParams) => nextMiddleware(next, request, serverParams), request, serverParams);
        };
    }
    callMethod(method, request, serverParams) {
        const callMethod = (request, serverParams) => {
            if (method) {
                return method(request, serverParams);
            }
            else if (request.id !== undefined) {
                return Promise.resolve(createMethodNotFoundResponse(request.id));
            }
            else {
                return Promise.resolve(null);
            }
        };
        const onError = (error) => {
            this.errorListener(`An unexpected error occurred while executing "${request.method}" JSON-RPC method:`, error);
            return Promise.resolve(this.mapErrorToJSONRPCErrorResponseIfNecessary(request.id, error));
        };
        try {
            return (this.middleware || noopMiddleware)(callMethod, request, serverParams).then(undefined, onError);
        }
        catch (error) {
            return onError(error);
        }
    }
    mapErrorToJSONRPCErrorResponseIfNecessary(id, error) {
        if (id !== undefined) {
            return this.mapErrorToJSONRPCErrorResponse(id, error);
        }
        else {
            return null;
        }
    }
}
const isNonNull = (value) => value !== null;
const noopMiddleware = (next, request, serverParams) => next(request, serverParams);
const mapResultToJSONRPCResponse = (id, result) => {
    if (id !== undefined) {
        return createJSONRPCSuccessResponse(id, result);
    }
    else {
        return null;
    }
};
const defaultMapErrorToJSONRPCErrorResponse = (id, error) => {
    let message = error?.message ?? "An unexpected error occurred";
    let code = DefaultErrorCode;
    let data;
    if (error instanceof JSONRPCErrorException) {
        code = error.code;
        data = error.data;
    }
    return createJSONRPCErrorResponse(id, code, message, data);
};
const mapResponse = (request, response) => {
    if (response) {
        return response;
    }
    else if (request.id !== undefined) {
        return createJSONRPCErrorResponse(request.id, JSONRPCErrorCode.InternalError, "Internal error");
    }
    else {
        return null;
    }
};
