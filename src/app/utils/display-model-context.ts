import { ElementId, ElementType } from "@domain/language";
import { createContext, Dispatch, SetStateAction } from "react";
import { DisplayModel } from "./display-model";

export type FilterType = Extract<keyof DisplayModel, "word" | "partOfSpeech" | "phrase" | "clause">;

export type ElementSelectNode = {
    id: ElementId;
    type: ElementType;
    property?: string;
}

export interface HeadElementSelectNode {
    id: ElementId;
    type: ElementType;
}

export function isHeadElementSelectNode(node: ElementSelectNode): node is HeadElementSelectNode {
    return node.property === undefined;
}

export interface TailElementSelectNode extends HeadElementSelectNode {
    property: string;
}

export function isTailElementSelectNode(node: ElementSelectNode): node is TailElementSelectNode {
    return node.property !== undefined;
}

export type SelectedElement = [HeadElementSelectNode, ...TailElementSelectNode[]];

export interface DisplayModelContext {
    displayModel: DisplayModel;
    topFilter?: FilterType;
    setTopFilter: Dispatch<SetStateAction<FilterType | undefined>>;
    selectedItem?: SelectedElement;
    setSelectedItem: Dispatch<SetStateAction<SelectedElement | undefined>>;
}

export const DisplayModelContext = createContext<DisplayModelContext>({
    displayModel: {
        word: [],
        partOfSpeech: [],
        phrase: [],
        clause: [],
        elements: {}
    },
    setTopFilter: () => { throw "not implemented"; },
    setSelectedItem: () => { throw "not implemented"; }
});