import hash from "object-hash";

interface ReducerData {
    reducedItems: Record<string, any>;
}

function _isValueType(value: any): boolean {
    return !Array.isArray(value) && typeof value !== "object";
}

function run<TValue>(value: TValue): TValue {
    if (_isValueType(value)) {
        return value;
    }
    const data: ReducerData = {
        reducedItems: {}
    };
    const output = _runHash(data, value);
    return output;
}

function _runHash(data: ReducerData, value: any): any {
    if (_isValueType(value)) {
        return value;
    }
    const { reducedItems } = data;
    const hashCode = hash(value);
    if (hashCode in reducedItems) {
        return reducedItems[hashCode];
    }
    let output: any;
    if (Array.isArray(value)) {
        output = _runArrayHash(data, value);
    } else if (typeof value === "object") {
        output = _runObjectHash(data, value);
    } else {
        throw "impossible case";
    }
    reducedItems[hashCode] = output;
    return output;
}

function _runArrayHash(data: ReducerData, value: any[]): any[] {
    const output = [];
    for (let index = 0; index < value.length; index++) {
        const element = value[index];
        const outputElement = _runHash(data, element);
        output.push(outputElement);
    }
    return output;
}

function _runObjectHash(data: ReducerData, value: Record<string, any>): Record<string, any> {
    const output: Record<string, any> = {};
    const entries = Object.entries(value);
    for (let index = 0; index < entries.length; index++) {
        const [key, subValue] = entries[index];
        const outputSubValue = _runHash(data, subValue);
        output[key] = outputSubValue;
    }
    return output;
}

export const HeapReducer = {
    run: run
};