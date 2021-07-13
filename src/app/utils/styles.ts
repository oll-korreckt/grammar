type ColorValues = [
    1,
    2,
    3,
    4,
    5,
    6,
    7,
    8,
    9,
    10,
    11,
    12
];
export type Colors = `color${ColorValues[number]}`;

type Styles = {
    readonly [key: string]: string;
}

export function accessClassName(styles: Styles, ...classNames: string[]): string {
    let output = "";
    if (classNames.length === 0) {
        return output;
    }
    output = getClassName(styles, classNames[0]);
    for (let index = 1; index < classNames.length; index++) {
        output += ` ${getClassName(styles, classNames[index])}`;
    }
    return output;
}

function getClassName(styles: Styles, className: string): string {
    const output = styles[className];
    if (output === undefined) {
        throw `Class name '${className}' does not exist`;
    }
    return output;
}