import { ElementTable } from "./element-table";
import { HTMLTableObject, ParseObject } from "@lib/utils";
import { PreprocessState } from "./preprocess-state";
import { ElementType } from "@domain/language/_types/utils";

function run(type: Exclude<ElementType, "word">, data: ParseObject[]): ParseObject[] {
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
            case "idHeading": {
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

export const Preprocessor = {
    run: run
};