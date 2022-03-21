function printArray(strings: string[], delimiter: string): string {
    if (strings.length === 0) {
        throw "cannot print an empty array";
    }
    let output = strings[0];
    for (let index = 1; index < strings.length; index++) {
        output += `${delimiter}${strings[index]}`;
    }
    return output;
}

function capitalize(value: string): string {
    if (value.length === 0) {
        throw "cannot capitalize empty string";
    }
    return value.charAt(0).toUpperCase() + value.slice(1);
}

function _createCharFunction<TOutput>(fn: (char: number) => TOutput): (char: string) => TOutput {
    return (char) => {
        if (char.length !== 1) {
            throw `Expected char: String of length 1.\nRecieved: '${char}'`;
        }
        const charCode = char.charCodeAt(0);
        return fn(charCode);
    };
}

function _getReplacementLengths(map: Record<string, string>): number[] {
    const output = new Set<number>();
    Object.keys(map).forEach((key) => {
        if (key.length === 0) {
            throw "cannot replace an empty string";
        }
        output.add(key.length);
    });
    if (output.size === 0) {
        throw "received empty map";
    }
    return Array.from(output).sort();
}

function _createReplacer(input: string, map: Record<string, string>): (index: number) => [chunk: string, incr: number] {
    const subStrLenArr = _getReplacementLengths(map);
    return (index) => {
        const maxSubStrLen = input.length - index;
        const minMatchLen = subStrLenArr[0];
        if (minMatchLen > maxSubStrLen) {
            // if the smallest substring is longer than the remainder then just
            // return the remainder in order to exit early
            const subStr = input.substring(index);
            return [subStr, subStr.length];
        }
        for (let i = 0; i < subStrLenArr.length; i++) {
            const subStrLen = subStrLenArr[i];
            if (subStrLen > maxSubStrLen) {
                break;
            }
            const subStr = input.substring(index, index + subStrLen);
            const replStr: string | undefined = map[subStr];
            if (replStr !== undefined) {
                return [replStr, subStrLen];
            }
        }
        const subStr = input.substring(index, index + 1);
        return [subStr, subStr.length];
    };
}

function replaceAll(input: string, map: Record<string, string>): string {
    const replacer = _createReplacer(input, map);
    let output = "";
    let index = 0;
    while (index < input.length) {
        const [subStr, incr] = replacer(index);
        output += subStr;
        index += incr;
    }
    return output;
}

const isEnglishLetterChar = _createCharFunction((char) => {
    const a = "a".charCodeAt(0);
    const z = "z".charCodeAt(0);
    const A = "A".charCodeAt(0);
    const Z = "Z".charCodeAt(0);
    const output = (char >= a && char <= z)
        || (char >= A && char <= Z);
    return output;
});

const isNumericChar = _createCharFunction((char) => {
    const zero = "0".charCodeAt(0);
    const nine = "9".charCodeAt(0);
    const output = char >= zero && char <= nine;
    return output;
});

export const Strings = {
    printArray: printArray,
    capitalize: capitalize,
    isEnglishLetterChar: isEnglishLetterChar,
    isNumericChar: isNumericChar,
    replaceAll: replaceAll
};