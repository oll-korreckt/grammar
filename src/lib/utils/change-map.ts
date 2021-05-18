import { AtomicChange, ChangeKey, ChangeType } from "./atomic-change";
import { SimpleObject, SimpleObjectValue } from "./simple-object";

export type ChangeMap = {
    type?: ChangeType;
    keys?: {
        [key: string]: ChangeMap;
    };
};

function update(map: ChangeMap, ...changes: AtomicChange[]): ChangeMap {
    const output = Object.assign({}, map);
    _updateInPlace(output, ...changes);
    return output;
}

function _updateInPlace(output: ChangeMap, ...changes: AtomicChange[]): void {
    changes.forEach((change) => {
        const endObj = _getEndObject(output, change.key);
        delete endObj.keys;
        endObj.type = change.type;
    });
}

function _getEndObject(map: ChangeMap, key: ChangeKey): ChangeMap {
    let output = map;
    for (let i = 0; i < key.length; i++) {
        if (output.type) {
            return output;
        }
        const subKey = key[i];
        if (output.keys === undefined) {
            output.keys = { [subKey]: {} };
        } else if (output.keys[subKey] === undefined) {
            output.keys[subKey] = {};
        }
        output = output.keys[subKey];
    }
    return output;
}

function getChanges(map: ChangeMap, base: SimpleObject, curr: SimpleObject): AtomicChange[] {
    const output: AtomicChange[] = [];
    _createCompressedChanges(base, curr, map, [], output);
    return output;
}

function _createCompressedChanges(base: SimpleObjectValue, curr: SimpleObjectValue, map: ChangeMap, key: ChangeKey, output: AtomicChange[]): void {
    switch (map.type) {
        case undefined:
            for (const subKey in map.keys) {
                const subMap = map.keys[subKey];
                const subBase = (base as SimpleObject)[subKey] as SimpleObject;
                const subCurr = (curr as SimpleObject)[subKey] as SimpleObject;
                _createCompressedChanges(subBase, subCurr, subMap, [...key, subKey], output);
            }
            break;
        case ChangeType.Remove:
            if (base !== undefined) {
                output.push(AtomicChange.createRemove(key, base));
            }
            break;
        case ChangeType.Set:
            if (!_equals(base, curr)) {
                output.push(AtomicChange.createSet(key, base, curr));
            }
            break;
    }
}

function _equals(x: SimpleObjectValue, y: SimpleObjectValue): boolean {
    const xType = typeof x;
    const yType = typeof y;
    if (xType !== yType) {
        return false;
    }
    switch (xType) {
        case "string":
        case "number":
        case "boolean":
        case "undefined":
            return x === y;
        case "object":
            return SimpleObject.deepEquals(
                x as SimpleObject,
                y as SimpleObject
            );
        default:
            throw `unaccepted data type ${xType}`;
    }
}

export const ChangeMap = {
    update: update,
    getChanges: getChanges
};