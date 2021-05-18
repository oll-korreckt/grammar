import { SimpleObject, SimpleObjectValue } from "@lib/utils";


export enum ChangeType {
    Remove = -1,
    Set = 1
}

export enum LinkType {
    Target,
    Reference
}

export type ChangeKey = string[];

export type AtomicChange = {
    key: ChangeKey;
    type: ChangeType.Remove;
    currVal: SimpleObjectValue;
} | {
    key: ChangeKey;
    type: ChangeType.Set;
    currVal: SimpleObjectValue;
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

function createRemove(key: ChangeKey, currentValue: SimpleObjectValue): AtomicChange {
    return {
        key: key,
        type: ChangeType.Remove,
        currVal: currentValue
    };
}

function invertChange(change: AtomicChange): AtomicChange {
    switch (change.type) {
        case ChangeType.Set:
            if (change.currVal === undefined) {
                return createRemove(change.key, change.newVal);
            }
            return createSet(change.key, change.newVal, change.currVal);
        case ChangeType.Remove:
            return createSet(change.key, undefined, change.currVal);
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

function applySingle<T extends SimpleObject>(output: T, change: AtomicChange) {
    const [endObj, endKey] = getEndObject(change.key, output);
    switch (change.type) {
        case ChangeType.Remove:
            delete endObj[endKey];
            break;
        case ChangeType.Set:
            endObj[endKey] = change.newVal;
            break;
    }
}

function getEndObject(key: ChangeKey, state: SimpleObject): [SimpleObject, string] {
    let output: SimpleObject = state;
    for (let i = 0; i < key.length - 1; i++) {
        const subKey = key[i];
        output = output[subKey];
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
