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

    decodeByteGenerator(byteDataGenerator) {
        currentByte = byteDataGenerator.next().value;
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
            currentByte = byteDataGenerator.next().value;
        }
        currentByte = byteDataGenerator.next().value;
        if (currentByte !== this.LF) {
            throw new Error("No CRLF at the end of Simple String");
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
            currentByte = byteDataGenerator.next().value;
        }
        currentByte = byteDataGenerator.next().value;
        if (currentByte !== this.LF) {
            throw new Error("No CRLF at the end of Integer");
        }
        return integer;
    }

    decodeBulkString(byteDataGenerator) {
        bulkStringLength = byteDataGenerator.next().value - 48;
        // return null if length of Bulk String is -1 (Null Bulk String)
        if (bulkStringLength === -1) {
            return null;
        }
        currentByte = byteDataGenerator.next().value;
        // check for CRLF in the beginning of Bulk String
        if (currentByte === this.CR) {
            currentByte = byteDataGenerator.next().value;
            if (currentByte === this.LF) {
                currentByte = byteDataGenerator.next().value;
            } else {
                throw new Error("No CRLF in the beginning of Bulk String");
            }
        } else {
            throw new Error("No CRLF in the beginning of Bulk String");
        }
        // allocate Buffer object and store Bulk String bytes to it
        buffer = Buffer.alloc(bulkStringLength);
        for (let i = 0; i < bulkStringLength; i++) {
            buffer.write(currentByte, i);
            currentByte = byteDataGenerator.next().value;
        }
        // check for CRLF at the end of Bulk String
        if (currentByte === this.CR) {
            currentByte = byteDataGenerator.next().value;
            if (currentByte !== this.LF) {
                throw new Error("No CRLF at the end of Bulk String");
            }
        } else {
            throw new Error("No CRLF at the end of Bulk String");
        }
        // return final Buffer object
        return buffer;
    }

    decodeArray(byteDataGenerator) {
        arrayLength = byteDataGenerator.next().value - 48;
        // check for CRLF in the beginning of Array
        if (currentByte === this.CR) {
            currentByte = byteDataGenerator.next().value;
            if (currentByte !== this.LF) {
                throw new Error("No CRLF in the beginning of Array");
            }
        } else {
            throw new Error("No CRLF in the beginning of Array");
        }
        array = [];
        // decode elements and push to array
        for (let i = 0; i < arrayLength; i++) {
            array.push(this.decodeByteGenerator(byteDataGenerator));
        }
        return array;
    }
}