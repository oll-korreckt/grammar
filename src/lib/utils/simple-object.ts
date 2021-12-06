export type SimpleObject = Record<string, any>;
type Values =
    | undefined
    | string
    | number
    | boolean
    | SimpleObject;
export type SimpleArray = Values[];
export type SimpleObjectValue = Values | SimpleArray;

export type SimpleObjectValueType =
    | "undefined"
    | "string"
    | "number"
    | "boolean"
    | "object"
    | "array";

function getValueType(value: SimpleObjectValue): SimpleObjectValueType {
    const type = typeof value;
    switch (type) {
        case "undefined":
        case "string":
        case "number":
        case "boolean":
            return type;
        case "object":
            return Array.isArray(value) ? "array" : "object";
        default:
            throw `Unsupported data type ${type}`;
    }
}

function deepEquals(value1: SimpleObjectValue, value2: SimpleObjectValue): boolean {
    const type1 = getValueType(value1);
    const type2 = getValueType(value2);
    if (type1 !== type2) {
        return false;
    }
    switch (type1) {
        case "boolean":
        case "number":
        case "string":
            return value1 === value2;
        case "undefined":
            return true;
        case "array":
            return deepEqualsArray(
                value1 as Values[],
                value2 as Values[]
            );
        case "object":
            return deepEqualsObject(
                value1 as SimpleObject,
                value2 as SimpleObject
            );
        default:
            throw `Unexpected type ${type1}`;
    }
}

function deepEqualsArray(array1: Values[], array2: Values[]): boolean {
    if (array1.length !== array2.length) {
        return false;
    }
    for (let i = 0; i < array1.length; i++) {
        const value1 = array1[i];
        const value2 = array2[i];
        if (!deepEquals(value1, value2)) {
            return false;
        }
    }
    return true;
}

function getEntries(obj: SimpleObject): [string, Exclude<SimpleObjectValue, undefined>][] {
    const output = Object.entries(obj)
        .filter(([, value]) => value !== undefined) as [string, Exclude<SimpleObjectValue, undefined>][];
    return output;
}

function getSortedEntries(obj: SimpleObject): [string, Exclude<SimpleObjectValue, undefined>][] {
    const output = getEntries(obj)
        .sort(([key1], [key2]) => {
            if (key1 < key2) {
                return -1;
            }
            if (key1 > key2) {
                return 1;
            }
            return 0;
        });
    return output;
}

function deepEqualsObject(obj1: SimpleObject, obj2: SimpleObject): boolean {
    const obj1Entries = getSortedEntries(obj1);
    const obj2Entries = getSortedEntries(obj2);
    if (obj1Entries.length !== obj2Entries.length) {
        return false;
    }
    for (let i = 0; i < obj1Entries.length; i++) {
        const [key1, value1] = obj1Entries[i];
        const [key2, value2] = obj2Entries[i];
        if (key1 !== key2) {
            return false;
        }
        if (!deepEquals(
            value1 as SimpleObjectValueType,
            value2 as SimpleObjectValueType)) {
            return false;
        }
    }
    return true;
}

function clone<T extends SimpleObjectValue>(value: T): T {
    const type = getValueType(value);
    switch (type) {
        case "undefined":
        case "string":
        case "number":
        case "boolean":
            return value;
        case "object":
            return cloneObject(value as SimpleObject) as T;
        case "array":
            return cloneArray(value as Values[]) as T;
    }
}

function cloneObject(obj: SimpleObject): SimpleObject {
    const output: any = {};
    Object.entries(obj).forEach(([key, val]) => {
        output[key] = clone(val);
    });
    return output;
}

function cloneArray(arr: Values[]): Values[] {
    const output: Values[] = [];
    arr.forEach((value) => {
        output.push(clone(value));
    });
    return output;
}

function clean(obj: SimpleObject): SimpleObject {
    const output: SimpleObject = {};
    Object.entries(obj).forEach(([key, value]) => {
        if (value !== undefined) {
            output[key] = value;
        }
    });
    return output;
}

function sameKeys(obj1: Record<string, any>, obj2: Record<string, any>): boolean {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let index = 0; index < keys2.length; index++) {
        const key = keys1[index];
        if (!(key in obj2)) {
            return false;
        }
    }
    return true;
}

export const SimpleObject = {
    deepEquals: deepEquals,
    clone: clone,
    getValueType: getValueType,
    getSortedEntries: getSortedEntries,
    clean: clean,
    sameKeys: sameKeys
};
