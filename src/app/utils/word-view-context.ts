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
    property?: string | [string, string];
}

export interface HeadSelectNode {
    id: ElementId;
    state: ElementSelectState;
    type: ElementType;
}

export function isHeadElementSelectNode(node: SelectNode): node is HeadSelectNode {
    return node.property === undefined;
}

export interface TailSelectNode extends HeadSelectNode {
    state: ElementSelectState;
    property: string | [string, string];
}

export function isTailElementSelectNode(node: SelectNode): node is TailSelectNode {
    return node.property !== undefined;
}

export type SelectedNodeChain = [HeadSelectNode, ...TailSelectNode[]];
export type WordViewCategory = "partOfSpeech" | "phraseAndClause";

export interface WordViewContext {
    category: WordViewCategory;
    selectedItem?: SelectedNodeChain;
}

export const WordViewContext = createContext<WordViewContext>({
    category: "partOfSpeech"
});

function generateChain(state: DiagramState, id: ElementId, selectState: ElementSelectState): SelectedNodeChain {
    let output: Omit<SelectNode, "state">[] = [];
    let parentId: ElementId | undefined = id;
    let childId: ElementId | undefined = undefined;
    let childItem: DiagramStateItem | undefined = undefined;
    while (parentId !== undefined) {
        const parentItem = DiagramState.getItem(state, parentId);
        const newNode: Omit<SelectNode, "state"> = {
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