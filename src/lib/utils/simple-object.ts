export type SimpleObject = {
    [key: string]:
    | undefined
    | boolean
    | number
    | bigint
    | string
    | SimpleObject;
};

function deepEquals<T extends SimpleObject>(obj1: T, obj2: T): boolean {
    function getEntries(obj: T) {
        return Object.entries(obj)
            .filter(([, value]) => {
                const valueType = typeof value;
                return valueType !== "undefined";
            })
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
        const [key1, value1] = obj1Entries[i];
        const [key2, value2] = obj2Entries[i];
        if (key1 !== key2) {
            return false;
        }
        const type1 = typeof value1;
        const type2 = typeof value2;
        if (type1 !== type2) {
            return false;
        }
        if (type1 === "object") {
            if (!deepEquals(value1 as SimpleObject, value2 as SimpleObject)) {
                return false;
            }
        } else {
            if (value1 !== value2) {
                return false;
            }
        }
    }
    return true;
}

function clone<T extends SimpleObject>(obj: T): T {
    const output: any = {};
    Object.entries(obj).forEach(([key, val]) => {
        output[key] = typeof val === "object" ? clone(val) : val;
    });
    return output;
}

export const SimpleObject = {
    deepEquals: deepEquals,
    clone: clone
};
