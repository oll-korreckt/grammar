import { ChangeType, ChangeKey, SimpleObject, AtomicChange } from "@lib/utils";

export type ChangeMap = {
    [key: string]: ChangeMap | ChangeType.Set | ChangeType.Delete;
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
        switch (subChgType) {
            case ChangeType.Delete:
            case ChangeType.Set:
                subMap[subKey] = subChgType;
                break;
            default:
                throw `Unsupported ChangeType ${subChgType}`;
        }
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

function extractChanges(map: ChangeMap, currVal: SimpleObject, newVal: SimpleObject): AtomicChange[] {
    const output: AtomicChange[] = [];
    _extractChanges(
        map,
        currVal,
        newVal,
        [],
        output
    );
    return output;
}

function _extractChanges(subMap: ChangeMap, subCurrVal: SimpleObject, subNewVal: SimpleObject, path: string[], output: AtomicChange[]): void {
    for (const [key, value] of Object.entries(subMap)) {
        const fullKey = [...path, key];
        if (typeof value === "object") {
            _extractChanges(
                value,
                subCurrVal[key],
                subNewVal[key],
                fullKey,
                output
            );
        } else {
            let change: AtomicChange;
            switch (value) {
                case ChangeType.Set:
                    change = AtomicChange.createSet(
                        fullKey,
                        subCurrVal[key],
                        subNewVal[key]
                    );
                    break;
                case ChangeType.Delete:
                    change = AtomicChange.createDelete(
                        fullKey,
                        subCurrVal[key]
                    );
                    break;
                default:
                    throw `Unsupported change type: ${value}`;
            }
            output.push(change);
        }
    }
}

export const ChangeMap = {
    update: updateChangeMap,
    extractChanges: extractChanges
};