import "mocha";
import { expect } from "chai";
import { JSONRPCClient } from "./client";
import { JSONRPCServer } from "./server";
import { JSONRPCServerAndClient } from "./server-and-client";
describe("interfaces", () => {
    describe("independent server and client", () => {
        let client;
        let server;
        beforeEach(() => {
            client = new JSONRPCClient(async (request) => {
                const response = await server.receive(request);
                if (response) {
                    client.receive(response);
                }
            });
            server = new JSONRPCServer();
        });
        describe("calling method with no args no return", () => {
            let noArgsNoReturnCalled;
            beforeEach(() => {
                noArgsNoReturnCalled = false;
                server.addMethod("noArgsNoReturn", () => {
                    noArgsNoReturnCalled = true;
                });
                return client.request("noArgsNoReturn");
            });
            it("should call the method", () => {
                expect(noArgsNoReturnCalled).to.be.true;
            });
        });
        describe("calling method with no args", () => {
            let expected;
            let actual;
            beforeEach(async () => {
                expected = "return value";
                server.addMethod("noArgs", () => {
                    return expected;
                });
                actual = await client.request("noArgs");
            });
            it("should call the method", () => {
                expect(actual).to.equal(expected);
            });
        });
        describe("calling method with object args", () => {
            let actual;
            beforeEach(async () => {
                server.addMethod("objectArgs", ({ foo, bar }) => {
                    return `${foo}.${bar}`;
                });
                actual = await client.request("objectArgs", {
                    foo: "string value",
                    bar: 123,
                });
            });
            it("should call the method", () => {
                expect(actual).to.equal("string value.123");
            });
        });
        describe("calling method with array args", () => {
            let actual;
            beforeEach(async () => {
                server.addMethod("arrayArgs", ([foo, bar]) => {
                    return `${foo}.${bar}`;
                });
                actual = await client.request("arrayArgs", ["string value", 123]);
            });
            it("should call the method", () => {
                expect(actual).to.equal("string value.123");
            });
        });
    });
    describe("server and client", () => {
        let serverAndClientA;
        let serverAndClientB;
        beforeEach(() => {
            serverAndClientA = new JSONRPCServerAndClient(new JSONRPCServer(), new JSONRPCClient((request) => serverAndClientB.receiveAndSend(request)));
            serverAndClientB = new JSONRPCServerAndClient(new JSONRPCServer(), new JSONRPCClient((request) => serverAndClientA.receiveAndSend(request)));
            serverAndClientA.addMethod("echo", ({ message }) => message);
            serverAndClientB.addMethod("sum", ({ x, y }) => x + y);
        });
        describe("calling method from server A to B", () => {
            let actual;
            beforeEach(async () => {
                actual = await serverAndClientA.request("sum", { x: 1, y: 2 });
            });
            it("should call the method", () => {
                expect(actual).to.equal(3);
            });
        });
        describe("calling method from server B to A", () => {
            let expected;
            let actual;
            beforeEach(async () => {
                expected = "hello";
                actual = await serverAndClientB.request("echo", { message: expected });
            });
            it("should call the method", () => {
                expect(actual).to.equal(expected);
            });
        });
    });
});
