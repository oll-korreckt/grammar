import { PrimitiveType } from "./types";

export type SimpleObject = Record<string, unknown>;
export type SimpleObjectValue =
    | undefined
    | string
    | number
    | boolean
    | SimpleObject;

function deepEquals<T extends Record<string, unknown>>(obj1: T, obj2: T): boolean {
    function getEntries(obj: T) {
        return Object.entries(obj)
            .map<[string, unknown, PrimitiveType]>(([key, value]) => [key, value, typeof value])
            .filter(([, , type]) => type !== "undefined")
            .sort(([key1], [key2]) => {
                if (key1 < key2) {
                    return -1;
                }
                if (key1 > key2) {
                    return 1;
                }
                return 0;
            });
    }

    const obj1Entries = getEntries(obj1);
    const obj2Entries = getEntries(obj2);
    if (obj1Entries.length !== obj2Entries.length) {
        return false;
    }
    for (let i = 0; i < obj1Entries.length; i++) {
        const [key1, value1, type1] = obj1Entries[i];
        const [key2, value2, type2] = obj2Entries[i];
        if (key1 !== key2) {
            return false;
        }
        if (type1 !== type2) {
            return false;
        }
        switch (type1) {
            case "object":
                if (!deepEquals(value1 as SimpleObject, value2 as SimpleObject)) {
                    return false;
                }
                break;
            case "number":
            case "string":
            case "boolean":
                if (value1 !== value2) {
                    return false;
                }
                break;
            default:
                throw `SimpleObjects cannot contain values of type ${type1}`;
        }
    }
    return true;
}

function clone<T extends SimpleObject>(obj: T): T {
    const output: any = {};
    Object.entries(obj).forEach(([key, val]) => {
        output[key] = typeof val === "object" ? clone(val as SimpleObject) : val;
    });
    return output;
}

export const SimpleObject = {
    deepEquals: deepEquals,
    clone: clone
};
