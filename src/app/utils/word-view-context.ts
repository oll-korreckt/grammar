import { ElementCategory, ElementId, ElementType } from "@domain/language";
import { createContext } from "react";
import { DiagramState, DiagramStateContext } from ".";
import { DisplayModel, WordIndices, WordRange } from "./display-model";

export type ElementData = {
    head: boolean;
    id: ElementId;
    key: string;
    type: ElementType;
    lexemes: string[];
    selected: boolean;
    index: WordIndices[number];
}

export interface ChainItem {
    id: ElementId;
    type: ElementType;
}

export type SelectedElementChain = ChainItem[];
export type WordViewMode =
    | "navigate"
    | "add"
    | "edit.browse"
    | "edit.active"
    | "delete";

export interface WordViewContext {
    elementCategory: ElementCategory;
    visibleElements: ElementData[];
    selectedElement?: ElementId;
}

export const WordViewContext = createContext<WordViewContext>({
    elementCategory: "clause",
    visibleElements: []
});

type ElementFilterFunction = (cat: ElementCategory) => boolean;

function getLexemes(diagram: DiagramState, index: WordIndices[number]): string[] {
    return (Array.isArray(index) ? WordRange.expand(index) : [index])
        .map((wIndex) => diagram.wordOrder[wIndex])
        .map((id) => DiagramState.getTypedItem(diagram, "word", id).value.lexeme);
}

function _placeElementData(data: ElementData, output: (ElementData | undefined)[]): void {
    if (Array.isArray(data.index)) {
        const [startIndex, endIndex] = data.index;
        output[startIndex] = data;
        for (let index = startIndex + 1; index < endIndex + 1; index++) {
            output[index] = undefined;
        }
    } else {
        output[data.index] = data;
    }
}

function _getElementData(diagram: DiagramState, model: DisplayModel, id: ElementId): ElementData[] {
    const output: ElementData[] = [];
    const elementType = DiagramState.getItem(diagram, id).type;
    const element = model[id];
    if (element.words.length === 0) {
        return [];
    }
    const headWIndex = element.words[0];
    const headData: ElementData = {
        head: true,
        selected: false,
        id: id,
        key: `${id}-0`,
        lexemes: getLexemes(diagram, headWIndex),
        type: elementType,
        index: headWIndex
    };
    output.push(headData);
    for (let i = 1; i < element.words.length; i++) {
        const tailWIndex = element.words[i];
        const tailData: ElementData = {
            head: false,
            selected: false,
            id: id,
            key: `${id}-${i}`,
            lexemes: getLexemes(diagram, tailWIndex),
            type: elementType,
            index: tailWIndex
        };
        output.push(tailData);
    }
    return output;
}


function _populate(diagram: DiagramState, model: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    _getElementData(diagram, model, id).forEach((data) => _placeElementData(data, output));
}

function _populateExpanded(diagram: DiagramState, displayModel: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    const displayElement = displayModel[id];
    const properties: Record<string, ElementId[]> = displayElement.properties
        ? displayElement.properties
        : {};
    Object.values(properties)
        .flat()
        .forEach((childId) => _populate(diagram, displayModel, childId, output));
}

function _selectedItem(diagram: DiagramState, displayModel: DisplayModel, elementCategory: ElementCategory, selectedElement: ElementId | undefined, output: (ElementData | undefined)[]): void {
    if (selectedElement === undefined) {
        return;
    }
    const selectedItem = SelectedNodeChain.generateChain(
        diagram,
        elementCategory,
        selectedElement
    );
    const lastItem = selectedItem[selectedItem.length - 1];
    _populateExpanded(diagram, displayModel, lastItem.id, output);
    for (let index = selectedItem.length - 2; index >= 0; index--) {
        const itemId = selectedItem[index].id;
        const childId = selectedItem[index + 1].id;
        const item = displayModel[itemId];
        if (item.properties === undefined) {
            throw "";
        }
        Object.values(item.properties)
            .flat()
            .filter((id) => id !== childId)
            .forEach((id) => _populate(diagram, displayModel, id, output));
    }
}

function _elementFilter(diagram: DiagramState, displayModel: DisplayModel, elementFilter: ElementFilterFunction, output: (ElementData | undefined)[]): void {
    Object.entries(displayModel)
        .filter(([, { category, ref }]) => {
            if (!elementFilter(category)) {
                return false;
            }
            if (ref === undefined) {
                return true;
            }
            const parentCategory = displayModel[ref].category;
            if (elementFilter(parentCategory)) {
                return false;
            }
            return true;
        })
        .forEach(([id]) => _populate(diagram, displayModel, id, output));
}

function _fillOutput(diagram: DiagramState, displayModel: DisplayModel, output: (ElementData | undefined)[]): void {
    let index = 0;
    while (index < output.length) {
        const data = output[index];
        if (data === undefined) {
            const id = diagram.wordOrder[index];
            _populate(diagram, displayModel, id, output);
            index++;
        } else {
            let jumpCnt = 1;
            if (Array.isArray(data.index)) {
                const [startIndex, endIndex] = data.index;
                jumpCnt = endIndex - startIndex + 1;
            }
            index += jumpCnt;
        }
    }
}

export function _getVisibleElements(diagram: DiagramState, displayModel: DisplayModel, elementCategory: ElementCategory, selectedElement: ElementId | undefined): ElementData[] {
    const output: (ElementData | undefined)[] = diagram.wordOrder.map(() => undefined);
    _elementFilter(
        diagram,
        displayModel,
        ElementCategory.getLayerFilter(elementCategory),
        output
    );
    _selectedItem(diagram, displayModel, elementCategory, selectedElement, output);
    _fillOutput(diagram, displayModel, output);

    return output.filter((x) => x !== undefined) as ElementData[];
}

export function createWordViewContext(state: DiagramStateContext, elementCategory: ElementCategory, selectedElement?: ElementId): WordViewContext {
    const visibleElements = _getVisibleElements(
        state.state,
        state.model,
        elementCategory,
        selectedElement
    );
    return {
        elementCategory: elementCategory,
        selectedElement: selectedElement,
        visibleElements: visibleElements
    };
}

function generateChain(state: DiagramState, elementCategory: ElementCategory, id: ElementId): SelectedElementChain {
    const filterFn = ElementCategory.getLayerFilter(elementCategory);
    let output: ChainItem[] = [];
    let parentId: ElementId | undefined = id;
    while (parentId !== undefined) {
        const parentItem = DiagramState.getItem(state, parentId);
        const parentCategory = ElementCategory.getElementCategory(parentItem.type);
        if (!filterFn(parentCategory)) {
            break;
        }
        const newNode: ChainItem = {
            id: parentId,
            type: parentItem.type
        };
        output = [newNode, ...output];
        parentId = parentItem.ref;
    }
    return output;
}

export const SelectedNodeChain = {
    generateChain: generateChain
};