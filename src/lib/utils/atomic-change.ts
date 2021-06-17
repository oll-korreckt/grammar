import { SimpleObject, SimpleObjectValue } from "@lib/utils";
import { SimpleArray, SimpleObjectValueType } from "./simple-object";

export enum ChangeType {
    Delete = -1,
    Set = 1,
    Remove = -2,
    Insert = 2
}

export type ChangeKey = (string | number)[];

export type AtomicChange = {
    key: ChangeKey;
    type: ChangeType.Delete;
    currVal: SimpleObjectValue;
} | {
    key: ChangeKey;
    type: ChangeType.Set;
    currVal: SimpleObjectValue;
    newVal: SimpleObjectValue;
} | {
    key: ChangeKey;
    type: ChangeType.Remove;
    currVal: SimpleObjectValue;
} | {
    key: ChangeKey;
    type: ChangeType.Insert;
    currVal: SimpleObjectValue;
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

function createInsert(key: ChangeKey, currentValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Insert,
        currVal: currentValue
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
            return createRemove(change.key, change.currVal);
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
            (endObj as SimpleArray).splice(endKey as number, 0, change.currVal);
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
