import { ElementCategory, ElementType, elementTypeLists, getElementDefinition } from "@domain/language";
import { HTMLObject, HTMLTableDataObject, HTMLTableHeaderObject, HTMLTableHeadObject, HTMLTableObject, HTMLTableRowObject, SimpleObject } from "@lib/utils";
import { ElementDisplayInfo } from "../../app/utils";
import { ElementPage, ElementPageType_ElementType } from "./types";

type PropertyDisplayInfo = ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]];
type PropertyDefinition = ReturnType<typeof getElementDefinition>[keyof ReturnType<typeof getElementDefinition>];
interface FullPropertyInfo extends PropertyDisplayInfo {
    keyName: string;
    isArray: boolean;
    validTypes: ElementPageType_ElementType[];
}
type FullPropertyInfoObject = Record<string, FullPropertyInfo>;

function _filterTypes(types: ElementType[]): ElementPageType_ElementType[] {
    return types.filter((type) => ElementPage.isPageType(type)) as ElementPageType_ElementType[];
}

function _createFullPropertyInfo(type: ElementPageType_ElementType): FullPropertyInfoObject {
    const displayInfo: Record<string, PropertyDisplayInfo> = ElementDisplayInfo.getDisplayInfo(type).properties;
    const elementDef: Record<string, PropertyDefinition> = getElementDefinition(type);
    if (!SimpleObject.sameKeys(displayInfo, elementDef)) {
        throw `Incongruence between element definition and display info for type '${type}'`;
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
            validTypes: _filterTypes(validTypes),
            isArray
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

export type PropertyHeaderType =
    | "name"
    | "required"
    | "allowMultiple"
    | "types"

function _isPropertyHeader(value: string | undefined): value is PropertyHeaderType {
    const headerTypes = new Set<PropertyHeaderType>([
        "name",
        "required",
        "allowMultiple",
        "types"
    ]);
    return headerTypes.has(value as any);
}

function getHeaderType(obj: HTMLTableHeaderObject): PropertyHeaderType {
    const { custom } = obj;
    if (!_isPropertyHeader(custom)) {
        throw `${obj.type} object does not contain a valid PropertyHeaderType value for custom`;
    }
    return custom;
}

function _createHeaders(inclPropCol: boolean): HTMLTableHeadObject {
    const headerCells: HTMLTableHeaderObject[] = [];
    if (inclPropCol) {
        headerCells.push({
            type: "th",
            content: "Name"
        });
    }
    headerCells.push(
        {
            type: "th",
            content: "Required?"
        },
        {
            type: "th",
            content: "Multi?"
        },
        {
            type: "th",
            content: "Type(s)"
        }
    );
    return {
        type: "thead",
        content: {
            type: "tr",
            cells: headerCells
        }
    };
}

function _createPropertyRow({ fullName, required, isArray, validTypes }: FullPropertyInfo, inclPropCol: boolean): HTMLTableRowObject<"data"> {
    const validTypesHtml: HTMLObject[] = [];
    validTypes.forEach((validType, index) => {
        if (index > 0) {
            validTypesHtml.push(", ");
        }
        const output = ElementPage.createTypeLink(validType);
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
        head: _createHeaders(true),
        body: {
            type: "tbody",
            content: _getSortedProps(info).map((propInfo) => _createPropertyRow(propInfo, true))
        }
    };
}

function _createPartialPropertyTable(info: FullPropertyInfoObject, property: string): HTMLTableObject {
    return {
        type: "table",
        head: _createHeaders(false),
        body: {
            type: "tbody",
            content: [_createPropertyRow(info[property], false)]
        }
    };
}

function createPropertyTable(type: ElementPageType_ElementType, property?: string): HTMLTableObject {
    const info = _createFullPropertyInfo(type);
    return property === undefined
        ? _createFullPropertyTable(info)
        : _createPartialPropertyTable(info, property);
}

function createElementInfoTable(type: ElementPageType_ElementType): HTMLTableObject {
    const info = ElementDisplayInfo.getDisplayInfo(type);
    const category = ElementCategory.getElementCategory(type);
    return {
        type: "table",
        head: {
            type: "thead",
            content: {
                type: "tr",
                cells: [
                    { type: "th", content: "Abbreviation" },
                    { type: "th", content: "Type" },
                    { type: "th", content: "Coordination" },
                    { type: "th", content: "Color" }
                ]
            }
        },
        body: {
            type: "tbody",
            content: [{
                type: "tr",
                cells: [
                    { type: "td", content: info.header },
                    { type: "td", content: ElementPage.createTypeLink(category) },
                    _createCoordinationCell(type),
                    { type: "td", custom: "color" }
                ]
            }]
        }
    };
}

function _createCoordinationCell(type: ElementPageType_ElementType): HTMLTableDataObject {
    if (!ElementCategory.isCoordinable(type)) {
        return { type: "td", content: "N/A" };
    }
    const coordinatedType = ElementCategory.coordinate(type) as Exclude<ElementType, "word">;
    const typeDef = getElementDefinition(coordinatedType);
    if (!("items" in typeDef)) {
        throw `No type definition found for '${coordinatedType}' derived from '${type}'`;
    }
    const [, validTypes] = typeDef["items"];
    const filteredValidTypes = _filterTypes(validTypes);
    const content: HTMLObject[] = [];
    filteredValidTypes.forEach((vType, index) => {
        if (index > 0) {
            content.push(", ");
        }
        const link = ElementPage.createTypeLink(vType);
        content.push(link);
    });
    return { type: "td", content };
}

function _createCoordinationTableRow(type: ElementPageType_ElementType): HTMLTableRowObject<"data"> {
    const nameCell: HTMLTableDataObject = {
        type: "td",
        content: ElementPage.createTypeLink(type)
    };
    const coordCell = _createCoordinationCell(type);
    return {
        type: "tr",
        cells: [nameCell, coordCell]
    };
}

function createCoordinationTable(): HTMLTableObject {
    const rows: HTMLTableRowObject<"data">[] = [];
    for (let index = 0; index < elementTypeLists.element.length; index++) {
        const type = elementTypeLists.element[index];
        if (!ElementPage.isElementType(type)) {
            continue;
        }
        const row = _createCoordinationTableRow(type);
        rows.push(row);
    }
    return {
        type: "table",
        head: {
            type: "thead",
            content: {
                type: "tr",
                cells: [
                    { type: "th", content: "Type" },
                    { type: "th", content: "Compatible Types" }
                ]
            }
        },
        body: { type: "tbody", content: rows }
    };
}

export const ElementTable = {
    createElementInfoTable: createElementInfoTable,
    createPropertyTable: createPropertyTable,
    getHeaderType: getHeaderType,
    createCoordinationTable: createCoordinationTable
};