import { describe, beforeEach, it } from "mocha";
import { expect } from "chai";
import * as sinon from "sinon";
import { JSONRPCServerAndClient, JSONRPCServer, JSONRPC, JSONRPCErrorCode, } from ".";
import { JSONRPCClient } from "./client";
describe("JSONRPCServerAndClient", () => {
    let serverAndClient1;
    let serverAndClient2;
    beforeEach(() => {
        serverAndClient1 = new JSONRPCServerAndClient(new JSONRPCServer(), new JSONRPCClient((payload) => {
            return serverAndClient2.receiveAndSend(payload, undefined);
        }));
        serverAndClient2 = new JSONRPCServerAndClient(new JSONRPCServer(), new JSONRPCClient((payload, params) => {
            return serverAndClient1.receiveAndSend(payload, params);
        }));
        serverAndClient1.addMethod("echo1", ({ message }) => message);
        serverAndClient1.addMethodAdvanced("echo1-2", async (jsonRPCRequest, params) => ({
            jsonrpc: JSONRPC,
            id: jsonRPCRequest.id,
            result: `${params?.userID} said ${jsonRPCRequest.params.message}`,
        }));
        serverAndClient2.addMethod("echo2", ({ message }) => message);
    });
    afterEach(() => {
        sinon.restore();
    });
    describe("requesting from server 1", () => {
        let result;
        beforeEach(async () => {
            result = await serverAndClient1.request("echo2", { message: "foo" });
        });
        it("should request to server 2", () => {
            expect(result).to.equal("foo");
        });
        describe("removing the method", () => {
            beforeEach(() => {
                serverAndClient2.removeMethod("echo2");
            });
            describe("requesting from server 1", () => {
                let response;
                beforeEach(async () => {
                    response = await serverAndClient1.requestAdvanced({
                        jsonrpc: JSONRPC,
                        id: 0,
                        method: "echo2",
                        params: { message: "foo" },
                    });
                });
                it("should return not found", () => {
                    expect(response.error?.code).to.equal(JSONRPCErrorCode.MethodNotFound);
                });
            });
        });
    });
    describe("requesting from server 2", () => {
        let result;
        beforeEach(async () => {
            result = await serverAndClient2.request("echo1", { message: "bar" });
        });
        it("should request to server 1", () => {
            expect(result).to.equal("bar");
        });
    });
    describe("requesting from server 1 using advanced method", () => {
        let response;
        beforeEach(async () => {
            const request = {
                jsonrpc: JSONRPC,
                id: 0,
                method: "echo1-2",
                params: { message: "test" },
            };
            response = await serverAndClient2.requestAdvanced(request, {
                userID: "baz",
            });
        });
        it("should request to server 1", () => {
            expect(response.result).to.equal(`baz said test`);
        });
    });
    describe("requesting in batch", () => {
        let responses;
        beforeEach(async () => {
            const requests = [
                { jsonrpc: JSONRPC, id: 0, method: "echo2", params: { message: "1" } },
                { jsonrpc: JSONRPC, id: 1, method: "echo2", params: { message: "2" } },
            ];
            responses = await serverAndClient1.requestAdvanced(requests);
        });
        it("should return responses", () => {
            expect(responses).to.deep.equal([
                { jsonrpc: JSONRPC, id: 0, result: "1" },
                { jsonrpc: JSONRPC, id: 1, result: "2" },
            ]);
        });
    });
    describe("receiving invalid JSON-RPC message", () => {
        let promise;
        beforeEach(() => {
            promise = serverAndClient1.receiveAndSend({});
        });
        it("should fail", () => {
            return promise.then(() => Promise.reject(new Error("Expected to fail")), () => undefined);
        });
    });
    describe("having a pending request", () => {
        let promise;
        let resolve;
        beforeEach(() => {
            serverAndClient2.addMethod("hang", () => {
                return new Promise((givenResolve) => (resolve = givenResolve));
            });
            promise = serverAndClient1.request("hang", undefined);
        });
        describe("rejecting all pending requests", () => {
            let message;
            beforeEach(() => {
                message = "Connection is closed.";
                serverAndClient1.rejectAllPendingRequests(message);
                resolve();
            });
            it("should reject the pending request", () => {
                return promise.then(() => Promise.reject(new Error("Expected to fail")), (error) => expect(error.message).to.equal(message));
            });
        });
    });
    describe("requesting with timeout", () => {
        let fakeTimers;
        let delay;
        let resolve;
        let promise;
        beforeEach(() => {
            fakeTimers = sinon.useFakeTimers();
            delay = 100;
            serverAndClient2.addMethod("timeout", () => new Promise((givenResolve) => (resolve = givenResolve)));
            promise = serverAndClient1.timeout(delay).request("timeout");
        });
        describe("timing out", () => {
            beforeEach(() => {
                fakeTimers.tick(delay);
                resolve();
            });
            it("should reject", () => {
                return promise.then(() => Promise.reject(new Error("Expected to fail")), () => undefined);
            });
        });
        describe("not timing out", () => {
            beforeEach(() => {
                resolve();
            });
            it("should succeed", () => {
                return promise;
            });
        });
    });
});
