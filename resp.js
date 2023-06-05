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
        const byteDataGenerator = this.byteGenerator(byteArray);
        return this.decodeByteGenerator(byteDataGenerator);
    }

    decodeByteGenerator(byteDataGenerator) {
        const currentByte = byteDataGenerator.next().value;
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
        let currentByte = byteDataGenerator.next().value;
        const simpleString = [];
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
        let currentByte = byteDataGenerator.next().value;
        let integer = 0;
        let sign = 1;
        // check beginning of Integer for plus or minus sign
        if (currentByte === 45) {
            sign = -1;
            currentByte = byteDataGenerator.next().value;
        } else if (currentByte === 43) {
            currentByte = byteDataGenerator.next().value;
        }
        while (currentByte !== this.CR) {
            integer = integer * 10 + (currentByte - 48);
            currentByte = byteDataGenerator.next().value;
        }
        currentByte = byteDataGenerator.next().value;
        if (currentByte !== this.LF) {
            throw new Error("No CRLF at the end of Integer");
        }
        return integer * sign;
    }

    decodeBulkString(byteDataGenerator) {
        const bulkStringLength = byteDataGenerator.next().value - 48;
        // return null if length of Bulk String is -1 (Null Bulk String)
        if (bulkStringLength === -1) {
            return null;
        }
        let currentByte = byteDataGenerator.next().value;
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
        const buffer = Buffer.alloc(bulkStringLength);
        for (let i = 0; i < bulkStringLength; i++) {
            buffer.writeUInt8(currentByte, i);
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
        const arrayLength = byteDataGenerator.next().value - 48;
        let currentByte = byteDataGenerator.next().value;
        // check for CRLF in the beginning of Array
        if (currentByte === this.CR) {
            currentByte = byteDataGenerator.next().value;
            if (currentByte !== this.LF) {
                throw new Error("No CRLF in the beginning of Array");
            }
        } else {
            throw new Error("No CRLF in the beginning of Array");
        }
        const array = [];
        // decode elements and push to array
        for (let i = 0; i < arrayLength; i++) {
            array.push(this.decodeByteGenerator(byteDataGenerator));
        }
        return array;
    }
}

module.exports = {
    RESP,
};