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
        const bulkStringLength = this.decodeInteger(byteDataGenerator);
        // return null if length of Bulk String is -1 (Null Bulk String)
        if (bulkStringLength === -1) {
            return null;
        }
        let currentByte = byteDataGenerator.next().value;
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
        const arrayLength = this.decodeInteger(byteDataGenerator);
        // return null if length of Array is -1 (Null Array)
        if (arrayLength === -1) {
            return null;
        }
        const array = [];
        // decode elements and push to array
        for (let i = 0; i < arrayLength; i++) {
            array.push(this.decodeByteGenerator(byteDataGenerator));
        }
        return array;
    }

    encodeSimpleString(decodedObject) {
        const simpleStringLength = decodedObject.length;
        const buffer = Buffer.alloc(simpleStringLength + 3);
        // write '+' in the beginning of buffer
        buffer.writeUint8(this.simpleStringStart, 0);
        // write characters of string to buffer
        for (let i = 0; i < simpleStringLength; i++) {
            buffer.write(decodedObject[i], i + 1);
        }
        // write CRLF at the end of buffer
        buffer.writeUint8(this.CR, simpleStringLength + 2);
        buffer.writeUint8(this.LF, simpleStringLength + 3);
        return buffer;
    }

    encodeError(decodedObject) {
        const errorLength = decodedObject.length;
        const buffer = Buffer.alloc(errorLength + 3);
        // write '-' in the beginning of buffer
        buffer.writeUint8(this.errorStart, 0);
        // write characters of string to buffer
        for (let i = 0; i < errorLength; i++) {
            buffer.write(decodedObject[i], i + 1);
        }
        // write CRLF at the end of buffer
        buffer.writeUint8(this.CR, errorLength + 2);
        buffer.writeUint8(this.LF, errorLength + 3);
        return buffer;
    }

    encodeInteger(decodedObject) {
        const integerString = decodedObject.toString();
        const integerLength = integerString.length;
        const buffer = Buffer.alloc(integerLength + 3);
        // write ':' in the beginning of buffer
        buffer.writeUint8(this.integerStart, 0);
        // write characters of string to buffer
        for (let i = 0; i < integerLength; i++) {
            buffer.write(integerString[i], i + 1);
        }
        // write CRLF at the end of buffer
        buffer.writeUint8(this.CR, integerLength + 2);
        buffer.writeUint8(this.LF, integerLength + 3);
        return buffer;
    }
}

module.exports = {
    RESP,
};