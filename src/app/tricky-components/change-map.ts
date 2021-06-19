import { ChangeType, ChangeKey, SimpleObject } from "@lib/utils";

export type ChangeMap = {
    [key: string]: ChangeMap | ChangeType;
}

function updateChangeMap(map: ChangeMap, key: ChangeKey, chgType: ChangeType): ChangeMap {
    const output = SimpleObject.clone(map);
    let subMap = output;
    let subKey: string | undefined;
    let subChgType = chgType;
    for (let i = 0; i < key.length; i++) {
        const tempKey = key[i];
        if (typeof tempKey !== "string") {
            if (i === 0) {
                throw "First subKey cannot be a number";
            }
            terminalArray(output, key.filter((_, index) => index < i) as string[]);
            subChgType = ChangeType.Set;
            break;
        }
        subKey = tempKey;
        if (i === key.length - 1) {
            break;
        }
        if (subMap[subKey] === undefined) {
            subMap[subKey] = {};
        }
        const tempSubMap = subMap[subKey];
        if (typeof tempSubMap === "object") {
            subMap = tempSubMap;
        } else {
            return output;
        }
    }
    if (subKey !== undefined) {
        subMap[subKey] = subChgType;
    }
    return output;
}

function terminalArray(map: ChangeMap, keys: string[]): void {
    let subMap = map;
    for (let i = 0; i < keys.length - 1; i++) {
        const subKey = keys[i];
        subMap = subMap[subKey] as ChangeMap;
    }
    const lastSubKey = keys[keys.length - 1];
    subMap[lastSubKey] = ChangeType.Set;
}

export const ChangeMap = {
    update: updateChangeMap
};