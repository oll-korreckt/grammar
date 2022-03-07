import { ElementType, getElementDefinition } from "@domain/language";

export interface PreprocessState {
    type: Exclude<ElementType, "word">;
    typeKeys: Set<string>;
    hasOutline: boolean;
    headers: Set<string>;
    tables: {
        properties: Set<string>;
        propertySummary: boolean;
        elementInfo: boolean;
    };
}

const PROPERTY_SUMMARY: PreprocessorTableType = "propertySummary";
const ELEMENT_INFO: PreprocessorTableType = "elementInfo";

export type PreprocessorTableType =
    | "propertySummary"
    | "properties"
    | "elementInfo"

function init(type: Exclude<ElementType, "word">): PreprocessState {
    const keys = Object.keys(getElementDefinition(type));
    return {
        type: type,
        typeKeys: new Set(keys),
        hasOutline: false,
        headers: new Set(),
        tables: {
            properties: new Set(),
            propertySummary: false,
            elementInfo: false
        }
    };
}

function _clone({ type, typeKeys, hasOutline, headers, tables }: PreprocessState): PreprocessState {
    return {
        typeKeys: new Set(typeKeys),
        headers: new Set(headers),
        tables: {
            ...tables,
            properties: new Set(tables.properties)
        },
        type,
        hasOutline
    };
}

function _guardedAdd<T>(set: Set<T>, data: T): void {
    const preSize = set.size;
    set.add(data);
    if (set.size === preSize) {
        throw `Set already contains item '${data}'`;
    }
}

// eslint-disable-next-line @typescript-eslint/ban-types
function _guardedSet<ObjectType extends {}, ObjectKey extends keyof ObjectType>(obj: ObjectType, key: ObjectKey): void {
    const castObj = obj as any;
    if (typeof castObj[key] !== "boolean") {
        throw `Property '${key}' is not an object`;
    }
    if (castObj[key] === true) {
        throw `Property '${key}' has already been set`;
    }
    castObj[key] = true;
}

function addHeader(state: PreprocessState, header: string): PreprocessState {
    const output = _clone(state);
    _guardedAdd(output.headers, header);
    return output;
}

function addTable(state: PreprocessState, table: string): PreprocessState {
    const output = _clone(state);
    const outputTables = output.tables;
    const tableType = getTableType(output, table);
    switch (tableType) {
        case "propertySummary":
            _guardedSet(outputTables, "propertySummary");
            break;
        case "properties":
            _guardedAdd(outputTables.properties, table);
            break;
        case "elementInfo":
            _guardedSet(outputTables, "elementInfo");
            break;
    }
    return output;
}

function setOutline(state: PreprocessState): PreprocessState {
    const output = _clone(state);
    if (output.hasOutline) {
        throw "Data already contains an outline";
    }
    output.hasOutline = true;
    return output;
}

function checkState(state: PreprocessState): void {
    const {
        hasOutline,
        headers,
        tables,
        type,
        typeKeys
    } = state;
    if (!hasOutline) {
        throw `'${type}' is missing an outline`;
    }
    typeKeys.forEach((key) => {
        if (!headers.has(key)) {
            throw `'${type}' is missing header for '${key}'`;
        }
        if (!tables.properties.has(key)) {
            throw `'${type}' is missing table for '${key}'`;
        }
    });
    if (headers.size !== typeKeys.size) {
        throw `'${type}' has ${headers.size} header(s) but is expected to have ${typeKeys.size}`;
    }
    if (tables.properties.size !== typeKeys.size) {
        throw `'${type}' has ${tables.properties.size} table(s) but is expected to have ${typeKeys.size}`;
    }
}

function getTableType(state: PreprocessState, tableName: string): PreprocessorTableType {
    if (tableName === ELEMENT_INFO) {
        return "elementInfo";
    } else if (tableName === PROPERTY_SUMMARY) {
        return "propertySummary";
    } else if (state.typeKeys.has(tableName)) {
        return "properties";
    }
    throw `Cannot identify table type of '${tableName}'`;
}

export const PreprocessState = {
    init: init,
    addHeader: addHeader,
    addTable: addTable,
    setOutline: setOutline,
    checkState: checkState,
    getTableType: getTableType
};