const Buffer = require("node:buffer");

class RESP {
    constructor() {
        this.simpleStringStart = 43;
        this.errorStart = 45;
        this.integerStart = 58;
        this.bulkStringStart = 36;
        this.arrayStart = 42;
        this.CR = 13;
        this.LF = 10;
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

    decodeSimpleString(byteDataGenerator) {
        currentByte = byteDataGenerator.next().value;
        simpleString = [];
        while (currentByte !== this.CR) {
            simpleString.push(currentByte);
        }
        return Buffer.from(simpleString).toString();
    }

    decodeError(byteDataGenerator) {
        return this.decodeSimpleString(byteDataGenerator);
    }

    decodeInteger(byteDataGenerator) {
        currentByte = byteDataGenerator.next().value;
        integer = 0;
        while (currentByte !== this.CR) {
            integer = integer * 10 + (currentByte - 48);
        }
        return integer;
    }

    decodeBulkString(byteDataGenerator) {}

    decodeArray(byteDataGenerator) {}
}