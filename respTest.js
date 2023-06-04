const test = require("node:test");
const assert = require("assert");
const resp = require('./resp');

test("Decode Simple String", (t) => {
    respDecoder = new resp.RESP();
    buffer = Buffer.from("+OK\r\n");
    assert.strictEqual(respDecoder.decode(buffer), "OK");
});