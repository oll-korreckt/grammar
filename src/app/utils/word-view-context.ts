import { ElementId, ElementType } from "@domain/language";
import { createContext } from "react";
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

export type ElementSelectNode = {
    id: ElementId;
    type: ElementType;
    state: ElementSelectState;
    property?: [string] | [string, string];
}

export interface HeadElementSelectNode {
    id: ElementId;
    state: ElementSelectState;
    type: ElementType;
}

export function isHeadElementSelectNode(node: ElementSelectNode): node is HeadElementSelectNode {
    return node.property === undefined;
}

export interface TailElementSelectNode extends HeadElementSelectNode {
    state: ElementSelectState;
    property: [string] | [string, string];
}

export function isTailElementSelectNode(node: ElementSelectNode): node is TailElementSelectNode {
    return node.property !== undefined;
}

export type SelectedElement = [HeadElementSelectNode, ...TailElementSelectNode[]];
export type WordViewCategory = "partOfSpeech" | "phraseAndClause";

export interface WordViewContext {
    category: WordViewCategory;
    selectedItem?: SelectedElement;
}

export const WordViewContext = createContext<WordViewContext>({
    category: "partOfSpeech"
});