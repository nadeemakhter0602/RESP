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

test("Decode Negative Integer", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from(":-1000\r\n");
    assert.strictEqual(respDecoder.decode(buffer), -1000);
});

test("Decode Positive Signed Integer", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from(":+1000\r\n");
    assert.strictEqual(respDecoder.decode(buffer), 1000);
});

test("Decode Bulk String", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("$5\r\nhello\r\n");
    assert.deepStrictEqual(respDecoder.decode(buffer), Buffer.from("hello"));
});

test("Decode Array with Mixed Types", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("*5\r\n:1\r\n:2\r\n:3\r\n:4\r\n$5\r\nhello\r\n");
    const expected = [1, 2, 3, 4, Buffer.from("hello")];
    assert.deepStrictEqual(respDecoder.decode(buffer), expected);
});

test("Decode Nested Array", () => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n");
    const expected = [
        [1, 2, 3],
        ['Hello', 'World']
    ];
    assert.deepStrictEqual(respDecoder.decode(buffer), expected);
});