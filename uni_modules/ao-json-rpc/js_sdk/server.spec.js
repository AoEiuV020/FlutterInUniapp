import { beforeEach, describe, it } from "mocha";
import { expect } from "chai";
import { createJSONRPCErrorResponse, JSONRPC, JSONRPCErrorCode, JSONRPCErrorException, JSONRPCServer, } from ".";
describe("JSONRPCServer", () => {
    let server;
    let response;
    beforeEach(() => {
        response = null;
        server = new JSONRPCServer();
    });
    const waitUntil = (predicate) => {
        return Promise.resolve().then(() => {
            if (!predicate()) {
                return waitUntil(predicate);
            }
        });
    };
    describe("having an echo method", () => {
        beforeEach(() => {
            const echoMethod = ({ text }, serverParams) => {
                if (serverParams) {
                    return `${serverParams.userID} said ${text}`;
                }
                else {
                    return text;
                }
            };
            server.addMethod("echo", echoMethod);
        });
        describe("receiving a request to the method", () => {
            beforeEach(() => {
                return server
                    .receive({
                    jsonrpc: JSONRPC,
                    id: 0,
                    method: "echo",
                    params: { text: "foo" },
                })
                    .then((givenResponse) => (response = givenResponse));
            });
            it("should echo the text", () => {
                expect(response).to.deep.equal({
                    jsonrpc: JSONRPC,
                    id: 0,
                    result: "foo",
                });
            });
        });
        describe("receiving a request to the method with user ID", () => {
            beforeEach(() => {
                return server
                    .receiveJSON(JSON.stringify({
                    jsonrpc: JSONRPC,
                    id: 0,
                    method: "echo",
                    params: { text: "foo" },
                }), { userID: "bar" })
                    .then((givenResponse) => (response = givenResponse));
            });
            it("should echo the text with the user ID", () => {
                expect(response).to.deep.equal({
                    jsonrpc: JSONRPC,
                    id: 0,
                    result: "bar said foo",
                });
            });
        });
        describe("removing the echo method", () => {
            beforeEach(() => {
                server.removeMethod("echo");
            });
            describe("receiving a request to the method", () => {
                beforeEach(() => {
                    return server
                        .receive({
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: "echo",
                        params: { text: "foo" },
                    })
                        .then((givenResponse) => (response = givenResponse));
                });
                it("should respond not found", () => {
                    expect(response?.error?.code).to.equal(JSONRPCErrorCode.MethodNotFound);
                });
            });
        });
    });
    describe("responding undefined", () => {
        beforeEach(() => {
            server.addMethod("ack", () => undefined);
            return server
                .receive({ jsonrpc: JSONRPC, id: 0, method: "ack" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should response with null result", () => {
            expect(response).to.deep.equal({
                jsonrpc: JSONRPC,
                id: 0,
                result: null,
            });
        });
    });
    describe("throwing", () => {
        beforeEach(() => {
            server.addMethod("throw", () => {
                throw new Error("Test throwing");
            });
            return server
                .receive({ jsonrpc: JSONRPC, id: 0, method: "throw" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should respond error", () => {
            expect(response).to.deep.equal({
                jsonrpc: JSONRPC,
                id: 0,
                error: {
                    code: 0,
                    message: "Test throwing",
                },
            });
        });
    });
    describe("throwing JSONRPCErrorException", () => {
        let expected;
        beforeEach(() => {
            expected = {
                message: "thrown",
                code: 1234,
                data: {
                    foo: "bar",
                },
            };
            server.addMethod("throw", () => {
                throw new JSONRPCErrorException(expected.message, expected.code, expected.data);
            });
            return server
                .receive({ jsonrpc: JSONRPC, id: 0, method: "throw" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should respond error with custom code and data", () => {
            expect(response.error).to.deep.equal(expected);
        });
    });
    describe("rejecting", () => {
        beforeEach(() => {
            server.addMethodAdvanced("reject", () => Promise.reject(new Error("Test rejecting")));
            return server
                .receive({ jsonrpc: JSONRPC, id: 0, method: "reject" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should respond error", () => {
            expect(response).to.deep.equal({
                jsonrpc: JSONRPC,
                id: 0,
                error: {
                    code: 0,
                    message: "Test rejecting",
                },
            });
        });
    });
    describe("responding to a notification", () => {
        beforeEach(() => {
            server.addMethod("foo", () => "foo");
            return server
                .receive({ jsonrpc: JSONRPC, method: "foo" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should not respond", () => {
            expect(response).to.be.null;
        });
    });
    describe("error on a notification", () => {
        beforeEach(() => {
            server.addMethod("foo", () => Promise.reject(new Error("foo")));
            return server
                .receive({ jsonrpc: JSONRPC, method: "foo" })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should not respond", () => {
            expect(response).to.be.null;
        });
    });
    describe("responding null to a request", () => {
        beforeEach(() => {
            server.addMethodAdvanced("foo", () => Promise.resolve(null));
            return server
                .receive({
                jsonrpc: JSONRPC,
                id: 0,
                method: "foo",
            })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should respond error", () => {
            expect(response).to.deep.equal({
                jsonrpc: JSONRPC,
                id: 0,
                error: {
                    code: JSONRPCErrorCode.InternalError,
                    message: "Internal error",
                },
            });
        });
    });
    describe("receiving a request to an unknown method", () => {
        beforeEach(() => {
            return server
                .receive({
                jsonrpc: JSONRPC,
                id: 0,
                method: "foo",
            })
                .then((givenResponse) => (response = givenResponse));
        });
        it("should respond error", () => {
            expect(response).to.deep.equal({
                jsonrpc: JSONRPC,
                id: 0,
                error: {
                    code: JSONRPCErrorCode.MethodNotFound,
                    message: "Method not found",
                },
            });
        });
    });
    [{}, "", "invalid JSON"].forEach((invalidJSON) => {
        describe(`receiving an invalid JSON (${invalidJSON})`, () => {
            let response;
            beforeEach(async () => {
                response = (await server.receiveJSON(invalidJSON));
            });
            it("should respond an error", () => {
                expect(response.error.code).to.equal(JSONRPCErrorCode.ParseError);
            });
        });
    });
    [
        {},
        { jsonrpc: JSONRPC },
        { jsonrpc: JSONRPC + "invalid", method: "" },
    ].forEach((invalidRequest) => {
        describe(`receiving an invalid request (${JSON.stringify(invalidRequest)})`, () => {
            let response;
            beforeEach(async () => {
                response = (await server.receive(invalidRequest));
            });
            it("should respond an error", () => {
                expect(response.error.code).to.equal(JSONRPCErrorCode.InvalidRequest);
            });
        });
    });
    describe("having a custom mapErrorToJSONRPCErrorResponse method", () => {
        let errorMessagePrefix;
        let errorData;
        beforeEach(() => {
            errorMessagePrefix = "Error: ";
            errorData = {
                foo: "bar",
            };
            server.mapErrorToJSONRPCErrorResponse = (id, error) => createJSONRPCErrorResponse(id, error.code, `${errorMessagePrefix}${error.message}`, errorData);
        });
        describe("rejecting", () => {
            let errorCode;
            let errorMessage;
            let response;
            beforeEach(async () => {
                errorCode = 123;
                errorMessage = "test message";
                server.addMethod("throw", () => {
                    const error = new Error(errorMessage);
                    error.code = errorCode;
                    throw error;
                });
                response = (await server.receive({
                    jsonrpc: JSONRPC,
                    id: 0,
                    method: "throw",
                }));
            });
            it("should respond a custom error code", () => {
                expect(response.error.code).to.equal(errorCode);
            });
            it("should respond a custom error message", () => {
                expect(response.error.message).to.equal(`${errorMessagePrefix}${errorMessage}`);
            });
            it("should respond a custom error data", () => {
                expect(response.error.data).to.deep.equal(errorData);
            });
        });
    });
    describe("having an async method", () => {
        let methodName;
        let receivedRequest;
        let receivedServerParams;
        let returnedResponse;
        let returnFromMethod;
        let throwFromMethod;
        beforeEach(() => {
            methodName = "foo";
            server.addMethodAdvanced(methodName, (request, serverParams) => {
                receivedRequest = request;
                receivedServerParams = serverParams;
                return new Promise((resolve, reject) => {
                    returnedResponse = {
                        id: request.id,
                        jsonrpc: JSONRPC,
                        result: {
                            foo: "bar",
                        },
                    };
                    returnFromMethod = () => {
                        resolve(returnedResponse);
                    };
                    throwFromMethod = (error) => {
                        reject(error);
                    };
                });
            });
        });
        describe("using middleware", () => {
            let middlewareCalled;
            let nextReturned;
            beforeEach(() => {
                middlewareCalled = false;
                nextReturned = false;
                server.applyMiddleware((next, request, serverParams) => {
                    middlewareCalled = true;
                    return next(request, serverParams).then((result) => {
                        nextReturned = true;
                        return result;
                    });
                });
            });
            describe("requesting", () => {
                let givenRequest;
                let givenServerParams;
                let actualResponse;
                beforeEach(() => {
                    givenRequest = {
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: methodName,
                        params: { foo: "bar" },
                    };
                    givenServerParams = { userID: "baz" };
                    server
                        .receive(givenRequest, givenServerParams)
                        .then((response) => (actualResponse = response));
                    return consumeAllEvents();
                });
                it("should call the middleware", () => {
                    expect(middlewareCalled).to.be.true;
                });
                it("should receive a request", () => {
                    expect(receivedRequest).to.deep.equal(givenRequest);
                });
                it("should received server params", () => {
                    expect(receivedServerParams).to.deep.equal(givenServerParams);
                });
                it("should not return from the next middleware yet", () => {
                    expect(nextReturned).to.be.false;
                });
                describe("finishing the request", () => {
                    beforeEach(() => {
                        returnFromMethod();
                        return consumeAllEvents();
                    });
                    it("should return from the next middleware", () => {
                        expect(nextReturned).to.be.true;
                    });
                    it("should return a response", () => {
                        expect(actualResponse).to.deep.equal(returnedResponse);
                    });
                });
            });
            describe("using another middleware", () => {
                let secondMiddlewareCalled;
                beforeEach(() => {
                    secondMiddlewareCalled = false;
                    server.applyMiddleware((next, request, serverParams) => {
                        secondMiddlewareCalled = true;
                        return next(request, serverParams);
                    });
                });
                describe("requesting", () => {
                    beforeEach(() => {
                        server.receive({
                            jsonrpc: JSONRPC,
                            id: 0,
                            method: methodName,
                            params: {},
                        });
                    });
                    it("should call the first middleware", () => {
                        expect(middlewareCalled).to.be.true;
                    });
                    it("should call the second middleware", () => {
                        expect(secondMiddlewareCalled).to.be.true;
                    });
                });
            });
        });
        describe("using a middleware that changes request and server params", () => {
            let changedParams;
            let changedServerParams;
            beforeEach(() => {
                changedParams = {
                    foo: "bar",
                };
                changedServerParams = {
                    userID: "changed user ID",
                };
                server.applyMiddleware((next, request) => {
                    return next({
                        ...request,
                        params: changedParams,
                    }, changedServerParams);
                });
            });
            describe("requesting", () => {
                let givenRequest;
                beforeEach(() => {
                    givenRequest = {
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: methodName,
                        params: {
                            foo: "foo",
                        },
                    };
                    server.receive(givenRequest);
                    returnFromMethod();
                    return consumeAllEvents();
                });
                it("should change the request", () => {
                    let expectedRequest = {
                        ...givenRequest,
                        params: changedParams,
                    };
                    expect(receivedRequest).to.deep.equal(expectedRequest);
                });
                it("should change the server params", () => {
                    expect(receivedServerParams).to.deep.equal(changedServerParams);
                });
            });
        });
        describe("using a middleware that changes response", () => {
            let changedResponse;
            beforeEach(() => {
                server.applyMiddleware((next, request, serverParams) => {
                    return next(request, serverParams).then((response) => {
                        changedResponse = {
                            jsonrpc: JSONRPC,
                            id: response.id,
                            result: {
                                foo: new Date().toString(),
                            },
                        };
                        return changedResponse;
                    });
                });
            });
            describe("requesting", () => {
                let actualResponse;
                beforeEach(() => {
                    server
                        .receive({
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: methodName,
                        params: {},
                    })
                        .then((response) => (actualResponse = response));
                    returnFromMethod();
                    return consumeAllEvents();
                });
                it("should return the changed response", () => {
                    expect(actualResponse).to.deep.equal(changedResponse);
                });
            });
        });
        describe("using middleware that catches exception", () => {
            beforeEach(() => {
                server.applyMiddleware(async (next, request, serverParams) => {
                    try {
                        return await next(request, serverParams);
                    }
                    catch (error) {
                        return createJSONRPCErrorResponse(request.id, error.code || JSONRPCErrorCode.InternalError, error.message);
                    }
                });
            });
            describe("throwing", () => {
                let error;
                let actualResponse;
                beforeEach(() => {
                    server
                        .receive({
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: methodName,
                        params: {},
                    })
                        .then((response) => (actualResponse = response));
                    error = { code: 123, message: "test" };
                    throwFromMethod(error);
                    return consumeAllEvents();
                });
                it("should catch the exception on middleware", () => {
                    const expected = createJSONRPCErrorResponse(0, error.code, error.message);
                    expect(actualResponse).to.deep.equal(expected);
                });
            });
            describe("throwing from non-advanced method", () => {
                let message;
                let code;
                let actualResponse;
                beforeEach(async () => {
                    message = "thrown from non-advanced method";
                    code = 456;
                    server.addMethod("throw", async () => {
                        throw { message, code };
                    });
                    actualResponse = (await server.receive({
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: "throw",
                    }));
                });
                it("should catch the exception on middleware", () => {
                    const expected = createJSONRPCErrorResponse(0, code, message);
                    expect(actualResponse).to.deep.equal(expected);
                });
            });
        });
        describe("using multiple middleware", () => {
            let count;
            let first;
            let second;
            let third;
            beforeEach(() => {
                count = 0;
                server.applyMiddleware((next, request, serverParams) => {
                    first = ++count;
                    return next(request, serverParams);
                }, (next, request, serverParams) => {
                    second = ++count;
                    return next(request, serverParams);
                }, (next, request, serverParams) => {
                    third = ++count;
                    return next(request, serverParams);
                });
                server.receive({
                    jsonrpc: JSONRPC,
                    id: 0,
                    method: methodName,
                });
                return consumeAllEvents();
            });
            it("should call middleware in the applied order", () => {
                expect([first, second, third]).to.deep.equal([1, 2, 3]);
            });
        });
    });
    describe("receiving batch requests", () => {
        let responses;
        beforeEach(() => {
            server.addMethod("echo", ({ message }) => message);
        });
        describe("of 3 requests", () => {
            beforeEach(async () => {
                responses = await server.receive([
                    { jsonrpc: JSONRPC, id: 0, method: "echo", params: { message: "1" } },
                    { jsonrpc: JSONRPC, id: 1, method: "echo", params: { message: "2" } },
                    { jsonrpc: JSONRPC, id: 2, method: "echo", params: { message: "3" } },
                ]);
            });
            it("should return 3 responses", () => {
                expect(responses.map((response) => response.result)).to.deep.equal(["1", "2", "3"]);
            });
        });
        describe("of 1 request", () => {
            beforeEach(async () => {
                responses = await server.receive([
                    { jsonrpc: JSONRPC, id: 0, method: "echo", params: { message: "1" } },
                ]);
            });
            it("should return 1 response", () => {
                expect(responses.result).to.equal("1");
            });
        });
        describe("of notifications", () => {
            beforeEach(async () => {
                responses = await server.receive([
                    { jsonrpc: JSONRPC, method: "echo", params: { message: "1" } },
                ]);
            });
            it("should return null", () => {
                expect(responses).to.be.null;
            });
        });
        describe("of a valid and an invalid request", () => {
            beforeEach(async () => {
                responses = await server.receive([
                    1,
                    { jsonrpc: JSONRPC, id: 0, method: "echo", params: { message: "1" } },
                ]);
            });
            it("should return a failure and a success response", () => {
                expect(responses).to.deep.equal([
                    {
                        jsonrpc: JSONRPC,
                        id: null,
                        error: {
                            code: JSONRPCErrorCode.InvalidRequest,
                            message: "Invalid Request",
                        },
                    },
                    { jsonrpc: JSONRPC, id: 0, result: "1" },
                ]);
            });
        });
    });
});
const consumeAllEvents = () => new Promise((resolve) => setTimeout(resolve, 0));
