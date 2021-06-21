const MAX_VALUE = 26;
const A = "a".charCodeAt(0);
const Z = "z".charCodeAt(0);
const ALPHA = " abcdefghijklmnopqrstuvwxyz";

let currentId = 1;

export type SerialId = string;
export const SerialId = {
    getNextId: getNextId,
    numberToId: numberToId,
    idToNumber: idToNumber,
    isSerialId: isSerialId
};

function getNextId(): SerialId {
    const output = numberToId(currentId);
    currentId++;
    return output;
}

function numberToId(value: number): SerialId {
    if (value < 1) {
        throw `Inputs must be greater than 0. Received: ${value}`;
    }
    if (!Number.isInteger(value)) {
        throw `Inputs must be integer values. Received: ${value}`;
    }
    let quotient = value;
    let output = "";
    do {
        const newQuotient = Math.floor((quotient - 1) / MAX_VALUE);
        let remainder = (quotient % MAX_VALUE);
        if (remainder === 0) {
            remainder = 26;
        }
        output = mapNumber(remainder) + output;
        quotient = newQuotient;
    } while (quotient > 0);
    return output;
}

function idToNumber(value: SerialId): number {
    if (!isSerialId(value)) {
        throw `Input '${value}' is not a SerialId`;
    }
    let output = 0;
    for (let index = 0; index < value.length; index++) {
        const char = value.charAt(index);
        const digit = mapChar(char);
        const power = value.length - index - 1;
        output += (MAX_VALUE ** power) * digit;
    }
    return output;
}

function isSerialId(id: string): boolean {
    if (id.length === 0) {
        return false;
    }
    for (let index = 0; index < id.length; index++) {
        const charCode = id.charCodeAt(index);
        if (!(charCode >= A && charCode <= Z)) {
            return false;
        }
    }
    return true;
}

function mapNumber(value: number): SerialId {
    return ALPHA.charAt(value);
}

function mapChar(char: string): number {
    const charCode = char.charCodeAt(0);
    return charCode - A + 1;
}