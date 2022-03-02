import { ElementType, getElementDefinition } from "@domain/language";
import { HTMLAnchorObject, HTMLObject, HTMLTableDataObject, HTMLTableHeaderObject, HTMLTableObject, HTMLTableRowObject, SimpleObject } from "@lib/utils";
import { ElementDisplayInfo } from ".";

type PropertyDisplayInfo = ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]];
type PropertyDefinition = ReturnType<typeof getElementDefinition>[keyof ReturnType<typeof getElementDefinition>];
interface FullPropertyInfo extends PropertyDisplayInfo {
    keyName: string;
    isArray: boolean;
    validTypes: ElementType[];
}
type FullPropertyInfoObject = Record<string, FullPropertyInfo>;

function _createFullPropertyInfo(type: Exclude<ElementType, "word">): FullPropertyInfoObject {
    const displayInfo: Record<string, PropertyDisplayInfo> = ElementDisplayInfo.getDisplayInfo(type).properties;
    const elementDef: Record<string, PropertyDefinition> = getElementDefinition(type);
    if (!SimpleObject.sameKeys(displayInfo, elementDef)) {
        throw "";
    }
    const output: FullPropertyInfoObject = {};
    const keys = Object.keys(displayInfo);
    for (let index = 0; index < keys.length; index++) {
        const key = keys[index];
        const diEntry = displayInfo[key];
        const [isArray, validTypes] = elementDef[key];
        const fullInfo: FullPropertyInfo = {
            ...diEntry,
            keyName: key,
            isArray,
            validTypes
        };
        output[key] = fullInfo;
    }
    return output;
}

function _getSortedProps(obj: FullPropertyInfoObject): FullPropertyInfo[] {
    return Object.values(obj).sort((a, b) => a.displayOrder - b.displayOrder);
}

function _getYesNo(value: boolean): "Yes" | "No" {
    return value ? "Yes" : "No";
}

function _createHeaders(inclPropCol: boolean): HTMLTableRowObject<"header"> {
    const headerCells: HTMLTableHeaderObject[] = [];
    if (inclPropCol) {
        headerCells.push({ type: "th", content: "Property" });
    }
    headerCells.push(
        { type: "th", content: "Required?" },
        { type: "th", content: "Allow Multiple?" },
        { type: "th", content: "Types" }
    );
    return {
        type: "tr",
        header: true,
        cells: headerCells
    };
}

function _createPropertyRow({ fullName, required, isArray, validTypes }: FullPropertyInfo, inclPropCol: boolean): HTMLTableRowObject<"data"> {
    const validTypesHtml: HTMLObject[] = [];
    validTypes.filter((validType) => !validType.startsWith("coordinated")).forEach((validType, index) => {
        if (index > 0) {
            validTypesHtml.push(", ");
        }
        const typeInfo = ElementDisplayInfo.getDisplayInfo(validType);
        const output: HTMLAnchorObject = {
            type: "a",
            href: validType,
            content: {
                type: "code",
                content: typeInfo.fullName
            }
        };
        validTypesHtml.push(output);
    });
    const output: HTMLTableDataObject[] = [];
    if (inclPropCol) {
        output.push({ type: "td", content: fullName });
    }
    output.push(
        {
            type: "td",
            content: _getYesNo(!!required)
        },
        {
            type: "td",
            content: _getYesNo(isArray)
        },
        {
            type: "td",
            content: validTypesHtml.length === 1
                ? validTypesHtml[0]
                : validTypesHtml
        }
    );
    return {
        type: "tr",
        cells: output
    };
}

function _createFullPropertyTable(info: FullPropertyInfoObject): HTMLTableObject {
    return {
        type: "table",
        headers: _createHeaders(true),
        rows: _getSortedProps(info).map((propInfo) => _createPropertyRow(propInfo, true))
    };
}

function _createPartialPropertyTable(info: FullPropertyInfoObject, property: string): HTMLTableObject {
    return {
        type: "table",
        headers: _createHeaders(false),
        rows: [
            _createPropertyRow(info[property], false)
        ]
    };
}

function createPropertyTable(type: Exclude<ElementType, "word">, property?: string): HTMLTableObject {
    const info = _createFullPropertyInfo(type);
    return property === undefined
        ? _createFullPropertyTable(info)
        : _createPartialPropertyTable(info, property);
}

function createElementInfoTable(type: Exclude<ElementType, "word">): HTMLTableObject {
    const info = ElementDisplayInfo.getDisplayInfo(type);
    return {
        type: "table",
        headers: {
            type: "tr",
            header: true,
            cells: [
                { type: "th", content: "Abbreviation" },
                { type: "th", content: "Color" }
            ]
        },
        rows: [{
            type: "tr",
            cells: [
                { type: "td", content: info.header },
                { type: "td", custom: type }
            ]
        }]
    };
}

export const ElementTable = {
    createElementInfoTable: createElementInfoTable,
    createPropertyTable: createPropertyTable
};