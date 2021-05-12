import { SimpleObject } from "@lib/utils";

type SimpleObjectValue = SimpleObject[keyof SimpleObject];

export enum ChangeType {
    Remove = -1,
    Set = 1
}

export enum LinkType {
    Target,
    Reference
}

export type ChangeKey = string[];

export type AtomicChange = [
    ChangeKey,
    ChangeType.Remove,
    SimpleObjectValue
] | [
    ChangeKey,
    ChangeType.Set,
    SimpleObjectValue,
    SimpleObjectValue
];

function createSet(key: ChangeKey, currentValue: SimpleObjectValue, newValue: SimpleObjectValue): AtomicChange {
    return [key, ChangeType.Set, currentValue, newValue];
}

function createRemove(key: ChangeKey, currentValue: SimpleObjectValue): AtomicChange {
    return [key, ChangeType.Remove, currentValue];
}

function invertChange(atomicChange: AtomicChange): AtomicChange {
    const [key, chType, ...values] = atomicChange;
    switch (chType) {
        case ChangeType.Set:
            const [currVal, newVal] = values;
            if (currVal === undefined) {
                return [key, ChangeType.Remove, newVal];
            }
            return [key, ChangeType.Set, newVal, currVal];
        case ChangeType.Remove:
            return [atomicChange[0], ChangeType.Set, , values[0]];
    }
}

function apply<T extends SimpleObject>(target: T, ...changes: AtomicChange[]): T {
    const output = Object.assign({}, target);
    for (const change of changes) {
        applySingle(output, change);
    }
    return output;
}

function applyInverse<T extends SimpleObject>(target: T, ...changes: AtomicChange[]): T {
    const output = Object.assign({}, target);
    for (const change of changes) {
        const invChg = invertChange(change);
        applySingle(output, invChg);
    }
    return output;
}

function applySingle<T extends SimpleObject>(output: T, [key, type, ...values]: AtomicChange) {
    const [endObj, endKey] = getEndObject(key, output);
    switch (type) {
        case ChangeType.Remove:
            delete endObj[endKey];
            break;
        case ChangeType.Set:
            endObj[endKey] = values[1];
            break;
        default:
            throw `Unexpected ChangeType ${type}`;
    }
}

function getEndObject(key: ChangeKey, state: SimpleObject): [SimpleObject, string] {
    let output: SimpleObject = state;
    for (let i = 0; i < key.length - 1; i++) {
        const subKey = key[i];
        output = output[subKey] as SimpleObject;
    }
    return [output, key[key.length - 1]];
}

export const AtomicChange = {
    createSet: createSet,
    createRemove: createRemove,
    invertChange: invertChange,
    apply: apply,
    applyInverse: applyInverse
};
