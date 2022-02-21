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
    isNumericChar: isNumericChar
};