import { ElementTable } from "./element-table";
import { HTMLTableObject, ParseObject } from "@lib/utils";
import { PreprocessState } from "./preprocess-state";
import { ElementPageType_ElementCategory, ElementPageType_ElementType } from "./types";

function runElementType(type: ElementPageType_ElementType, data: ParseObject[]): ParseObject[] {
    let state = PreprocessState.init(type);
    const output: ParseObject[] = data.map((item) => {
        switch (item.type) {
            case "htmlInjection": {
                if (item.content) {
                    throw `'${item.type}' item with id '${item.id}' already contains content`;
                }
                state = PreprocessState.addTable(state, item.id);
                const tableType = PreprocessState.getTableType(state, item.id);
                let content: HTMLTableObject;
                switch (tableType) {
                    case "elementInfo":
                        content = ElementTable.createElementInfoTable(type);
                        break;
                    case "propertySummary":
                        content = ElementTable.createPropertyTable(type);
                        break;
                    case "properties":
                        content = ElementTable.createPropertyTable(type, item.id);
                        break;
                }
                return {
                    ...item,
                    content
                };
            }
            case "elementId": {
                state = PreprocessState.addHeader(state, item.id);
                break;
            }
            case "snippet": {
                if (item.name === type) {
                    state = PreprocessState.setOutline(state);
                }
                break;
            }
        }
        return item;
    });
    // PreprocessState.checkState(state);
    return output;
}

function runElementCategory(type: ElementPageType_ElementCategory, data: ParseObject[]): ParseObject[] {
    switch (type) {
        case "coordinated":
            return data.map((item) => {
                if (item.type === "htmlInjection"
                    && item.id === "coordTable") {
                    return {
                        ...item,
                        content: ElementTable.createCordinationTable()
                    };
                }
                return item;
            });
    }
    return data;
}

export const Preprocessor = {
    runElementType: runElementType,
    runElementCategory: runElementCategory
};