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

export const Strings = {
    printArray: printArray,
    capitalize: capitalize
};