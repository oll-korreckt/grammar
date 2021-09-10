import { ElementId, ElementType } from "@domain/language";
import { createContext } from "react";
import { DiagramState, DiagramStateItem } from ".";
import { WordIndices } from "./display-model";

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
export type WordViewCategory = "partOfSpeech" | "phraseAndClause";

export interface WordViewContext {
    category: WordViewCategory;
    selectedNode?: SelectNode;
}

export const WordViewContext = createContext<WordViewContext>({
    category: "partOfSpeech"
});

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