import { SimpleObject, SimpleObjectValue } from "@lib/utils";
import { SimpleArray, SimpleObjectValueType } from "./simple-object";

export enum ChangeType {
    Delete = -1,
    Set = 1,
    Remove = -2,
    Insert = 2
}

export type ChangeKey = (string | number)[];
export const ChangeKey = {
    sort: sortChangeKeys
};

function sortChangeKeys(key1: ChangeKey, key2: ChangeKey): number {
    const length = Math.min(key1.length, key2.length);
    return _sortChangeKeys(key1, key2, 0, length);
}

function _sortChangeKeys(key1: ChangeKey, key2: ChangeKey, index: number, length: number): number {
    if (!(index < length)) {
        return _compare(key1.length, key2.length);
    }
    const subKey1 = key1[index];
    const subKeyType1 = typeof subKey1;
    const subKey2 = key2[index];
    const subKeyType2 = typeof subKey2;
    if (subKeyType1 !== subKeyType2) {
        return _compare(subKeyType1, subKeyType2);
    }
    const tempResult = _compare(subKey1, subKey2);
    if (tempResult !== 0) {
        return tempResult;
    }
    return _sortChangeKeys(key1, key2, index + 1, length);
}

function _compare<T extends string | number>(value1: T, value2: T): number {
    if (value1 > value2) {
        return 1;
    }
    if (value1 < value2) {
        return -1;
    }
    return 0;
}

export type AtomicChange = DeleteChange | SetChange | RemoveChange | InsertChange;
export type DeleteChange = {
    key: ChangeKey;
    type: ChangeType.Delete;
    currVal: SimpleObjectValue;
}
export type SetChange = {
    key: ChangeKey;
    type: ChangeType.Set;
    currVal: SimpleObjectValue;
    newVal: SimpleObjectValue;
}
export type RemoveChange = {
    key: ChangeKey;
    type: ChangeType.Remove;
    currVal: SimpleObjectValue;
}
export type InsertChange = {
    key: ChangeKey;
    type: ChangeType.Insert;
    newVal: SimpleObjectValue;
}

function createSet(key: ChangeKey, currentValue: SimpleObjectValue, newValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Set,
        currVal: currentValue,
        newVal: newValue
    };
}

function createDelete(key: ChangeKey, currentValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Delete,
        currVal: currentValue
    };
}

function createRemove(key: ChangeKey, currentValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Remove,
        currVal: currentValue
    };
}

function createInsert(key: ChangeKey, newValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Insert,
        newVal: newValue
    };
}

function invertChange(change: AtomicChange): AtomicChange {
    switch (change.type) {
        case ChangeType.Set:
            if (change.currVal === undefined) {
                return createDelete(change.key, change.newVal);
            }
            return createSet(change.key, change.newVal, change.currVal);
        case ChangeType.Delete:
            return createSet(change.key, undefined, change.currVal);
        case ChangeType.Insert:
            return createRemove(change.key, change.newVal);
        case ChangeType.Remove:
            return createInsert(change.key, change.currVal);
        default:
            throw "Unhandled change type";
    }
}

function apply<T extends SimpleObject | SimpleArray>(target: T, ...changes: AtomicChange[]): T {
    const output = SimpleObject.clone(target);
    for (const change of changes) {
        applySingle(output, change);
    }
    return output;
}

function applyInverse<T extends SimpleObject | SimpleArray>(target: T, ...changes: AtomicChange[]): T {
    const output = SimpleObject.clone(target);
    for (const change of changes) {
        const invChg = invertChange(change);
        applySingle(output, invChg);
    }
    return output;
}

function applySingle<T extends SimpleObject | SimpleArray>(output: T, change: AtomicChange) {
    function checkChangeType(chgType: ChangeType, value: SimpleObject | SimpleArray) {
        function runCheck(expected: SimpleObjectValueType) {
            const vType = SimpleObject.getValueType(value);
            if (vType !== expected) {
                throw `Change of type '${chgType}' requires a value of type '${vType}'. Received '${expected}'`;
            }
        }

        switch (chgType) {
            case ChangeType.Delete:
            case ChangeType.Set:
                runCheck("object");
                break;
            case ChangeType.Insert:
            case ChangeType.Remove:
                runCheck("array");
                break;
            default:
                throw "Unhandled change type";
        }
    }

    const [endObj, endKey] = getEndObject(change.key, output);
    checkChangeType(change.type, endObj);
    switch (change.type) {
        case ChangeType.Delete:
            delete (endObj as SimpleObject)[endKey as string];
            break;
        case ChangeType.Set:
            (endObj as SimpleObject)[endKey as string] = change.newVal;
            break;
        case ChangeType.Insert:
            (endObj as SimpleArray).splice(endKey as number, 0, change.newVal);
            break;
        case ChangeType.Remove:
            (endObj as SimpleArray).splice(endKey as number, 1);
            break;
        default:
            throw "Unsupported change type value";
    }
}

type EndObject = [SimpleObject | SimpleArray, string | number];

function getEndObject(key: ChangeKey, state: SimpleObject | SimpleArray): EndObject {
    let output: any = state;
    for (let i = 0; i < key.length - 1; i++) {
        const subKey = key[i];
        output = output[subKey];
    }
    return [output, key[key.length - 1]];
}

export const AtomicChange = {
    createSet: createSet,
    createDelete: createDelete,
    createInsert: createInsert,
    createRemove: createRemove,
    invertChange: invertChange,
    apply: apply,
    applyInverse: applyInverse
};
