import { ElementId, ElementType } from "@domain/language";
import { createContext, Dispatch, SetStateAction } from "react";
import { ElementCategory } from "./display-model";

export type ElementSelectState = "expand" | "select";

export type ElementSelectNode = {
    id: ElementId;
    type: ElementType;
    state: ElementSelectState;
    property?: string;
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
    property: string;
}

export function isTailElementSelectNode(node: ElementSelectNode): node is TailElementSelectNode {
    return node.property !== undefined;
}

export type SelectedElement = [HeadElementSelectNode, ...TailElementSelectNode[]];

export interface DisplayModelContext {
    elementFilter?: ElementCategory;
    setElementFilter: Dispatch<SetStateAction<ElementCategory | undefined>>;
    selectedItem?: SelectedElement;
    setSelectedItem: Dispatch<SetStateAction<SelectedElement | undefined>>;
}

export const DisplayModelContext = createContext<DisplayModelContext>({
    setElementFilter: () => { throw "not implemented"; },
    setSelectedItem: () => { throw "not implemented"; }
});