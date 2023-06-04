const {
    Buffer
} = require("node:buffer");

class RESP {
    constructor() {
        this.simpleStringStart = Buffer.from("+").readUInt8(0);
        this.errorStart = Buffer.from("-").readUInt8(0);
        this.integerStart = Buffer.from(":").readUInt8(0);
        this.bulkStringStart = Buffer.from("$").readUInt8(0);
        this.arrayStart = Buffer.from("*").readUInt8(0);
    }

    * byteGenerator(byteArray) {
        for (const byte of byteArray) {
            yield byte;
        }
    }

    decode(byteArray) {
        byteDataGenerator = this.byteGenerator(byteArray);
        return this.decodeByteGenerator(byteDataGenerator);
    }

    decodeByteGenerator(byteDataGenerator, currentByte = null) {
        if (!currentByte) {
            currentByte = byteDataGenerator.next().value;
        } else {
            currentByte = currentByte;
        }
        if (currentByte == this.simpleStringStart) {
            return this.decodeSimpleString(byteDataGenerator);
        } else if (currentByte == this.errorStart) {
            return this.decodeError(byteDataGenerator);
        } else if (currentByte == this.integerStart) {
            return this.decodeInteger(byteDataGenerator);
        } else if (currentByte == this.bulkStringStart) {
            return this.decodeBulkString(byteDataGenerator);
        }
        return this.decodeArray(byteDataGenerator);
    }

    decodeSimpleString(byteDataGenerator) {}

    decodeError(byteDataGenerator) {}

    decodeInteger(byteDataGenerator) {}

    decodeBulkString(byteDataGenerator) {}

    decodeArray(byteDataGenerator) {}
}