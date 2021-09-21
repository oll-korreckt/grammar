import { ElementCategory, ElementId, ElementType } from "@domain/language";
import { createContext } from "react";
import { DiagramState, DiagramStateContext, DiagramStateItem } from ".";
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

export type ElementSelectState = "expand" | "select";

export type SelectNode = {
    id: ElementId;
    type: ElementType;
    state: ElementSelectState;
}

function getParent(state: DiagramState, id: ElementId): SelectNode | undefined {
    const item = DiagramState.getItem(state, id);
    if (item.ref === undefined) {
        return undefined;
    }
    const parent = DiagramState.getItem(state, item.ref);
    return {
        id: item.ref,
        type: parent.type,
        state: "expand"
    };
}

export const SelectNode = {
    getParent: getParent
};

export interface HeadSelectNode {
    id: ElementId;
    state: ElementSelectState;
    type: ElementType;
}

export interface TailSelectNode extends HeadSelectNode {
    state: ElementSelectState;
    property: string | [string, string];
}

export type SelectedNodeChain = [HeadSelectNode, ...TailSelectNode[]];
export type WordViewStage = "category" | "syntax";
export type WordViewMode = "navigate" | "label" | "edit" | "delete";

export interface WordViewContext {
    elementCategory: ElementCategory;
    mode: WordViewMode;
    visibleElements: ElementData[];
    selectedNode?: SelectNode;
}

export const WordViewContext = createContext<WordViewContext>({
    elementCategory: "word",
    mode: "navigate",
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


function _populate(diagram: DiagramState, model: DisplayModel, id: ElementId, selectState: ElementSelectState | undefined, output: (ElementData | undefined)[]): void {
    switch (selectState) {
        case "select":
            _populateSelected(diagram, model, id, output);
            break;
        case "expand":
            _populateExpanded(diagram, model, id, output);
            break;
        case undefined:
            _getElementData(diagram, model, id).forEach((data) => _placeElementData(data, output));
            break;
        default:
            throw " ";
    }
}

function _populateExpanded(diagram: DiagramState, displayModel: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    const displayElement = displayModel[id];
    const properties: Record<string, ElementId[]> = displayElement.properties
        ? displayElement.properties
        : {};
    Object.values(properties)
        .flat()
        .forEach((childId) => _populate(diagram, displayModel, childId, undefined, output));
}

function _populateSelected(diagram: DiagramState, displayModel: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    _getElementData(diagram, displayModel, id)
        .map((data) => { return { ...data, selected: true }; })
        .forEach((data) => _placeElementData(data, output));
}

function _selectedItem(diagram: DiagramState, displayModel: DisplayModel, selectedNode: SelectNode | undefined, output: (ElementData | undefined)[]): void {
    if (selectedNode === undefined) {
        return;
    }
    const selectedItem = SelectedNodeChain.generateChain(
        diagram,
        selectedNode.id,
        selectedNode.state
    );
    const lastItem = selectedItem[selectedItem.length - 1];
    _populate(diagram, displayModel, lastItem.id, lastItem.state, output);
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
            .forEach((id) => _populate(diagram, displayModel, id, undefined, output));
    }
}

function _elementFilter(diagram: DiagramState, displayModel: DisplayModel, elementFilter: ElementFilterFunction, output: (ElementData | undefined)[]): void {
    Object.entries(displayModel)
        .filter(([, { category, ref }]) => {
            const correctType = elementFilter(category);
            if (!correctType) {
                return false;
            }
            if (ref === undefined) {
                return true;
            }
            return !correctType;
        })
        .forEach(([id]) => _populate(diagram, displayModel, id, undefined, output));
}

function _fillOutput(diagram: DiagramState, displayModel: DisplayModel, output: (ElementData | undefined)[]): void {
    let index = 0;
    while (index < output.length) {
        const data = output[index];
        if (data === undefined) {
            const id = diagram.wordOrder[index];
            _populate(diagram, displayModel, id, undefined, output);
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

function createFilterFn(category: ElementCategory): ElementFilterFunction {
    let filterArray: ElementCategory[];
    switch (category) {
        case "word":
            filterArray = ["word"];
            break;
        case "partOfSpeech":
            filterArray = ["word", "partOfSpeech"];
            break;
        case "phrase":
            filterArray = ["word", "partOfSpeech", "phrase"];
            break;
        case "clause":
            filterArray = ["word", "partOfSpeech", "phrase", "clause"];
            break;
        default:
            throw `unhandled stage '${category}'`;
    }
    const filterObj = new Set(filterArray);
    return (cat) => filterObj.has(cat);
}

export function _getVisibleElements(diagram: DiagramState, displayModel: DisplayModel, elementCategory: ElementCategory, selectedNode: SelectNode | undefined): ElementData[] {
    const output: (ElementData | undefined)[] = diagram.wordOrder.map(() => undefined);
    _elementFilter(
        diagram,
        displayModel,
        createFilterFn(elementCategory),
        output
    );
    _selectedItem(diagram, displayModel, selectedNode, output);
    _fillOutput(diagram, displayModel, output);

    return output.filter((x) => x !== undefined) as ElementData[];
}

export function createWordViewContext(state: DiagramStateContext, data: Omit<WordViewContext, "visibleElements">): WordViewContext {
    const visibleElements = _getVisibleElements(
        state.state,
        state.model,
        data.elementCategory,
        data.selectedNode
    );
    return {
        ...data,
        visibleElements: visibleElements
    };
}

function generateChain(state: DiagramState, id: ElementId, selectState: ElementSelectState): SelectedNodeChain {
    type OutputNode = Omit<SelectNode, "state"> & { property?: string | [string, string]; };
    let output: OutputNode[] = [];
    let parentId: ElementId | undefined = id;
    let childId: ElementId | undefined = undefined;
    let childItem: DiagramStateItem | undefined = undefined;
    while (parentId !== undefined) {
        const parentItem = DiagramState.getItem(state, parentId);
        const newNode: OutputNode = {
            id: parentId,
            type: parentItem.type
        };
        if (childItem !== undefined) {
            const properties = DiagramState.getReferencingProperties(
                parentItem.type as Exclude<ElementType, "word">,
                parentItem.value,
                childId as ElementId
            );
            if (properties === undefined) {
                throw `child '${childId}' is not referenced by '${parentId}'`;
            }
            const childNode = output[0];
            childNode.property = properties;
        }
        output = [newNode, ...output];
        childItem = parentItem;
        childId = parentId;
        parentId = parentItem.ref;
    }
    return output.map((node, index) => {
        const nodeSelectState: ElementSelectState = index === output.length - 1
            ? selectState
            : "expand";
        return {
            ...node,
            state: nodeSelectState
        };
    }) as SelectedNodeChain;
}

export const SelectedNodeChain = {
    generateChain: generateChain
};