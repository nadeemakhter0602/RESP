const test = require("node:test");
const assert = require("assert");
const resp = require('./resp');

test("Decode Simple String", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("+OK\r\n");
    assert.strictEqual(respDecoder.decode(buffer), "OK");
});

test("Decode Error", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("-Error message\r\n");
    assert.strictEqual(respDecoder.decode(buffer), "Error message");
});

test("Decode Integer", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from(":1000\r\n");
    assert.strictEqual(respDecoder.decode(buffer), 1000);
});

test("Decode Bulk String", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("$5\r\nhello\r\n");
    assert.deepStrictEqual(respDecoder.decode(buffer), Buffer.from("hello"));
});