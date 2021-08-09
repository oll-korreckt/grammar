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

export const Strings = {
    printArray: printArray
};