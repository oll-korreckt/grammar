import { DerivationTree, DiagramState, DiagramStateContext, HistoryState, SelectNode, WordViewCategory, WordViewContext } from "@app/utils";
import { ElementId, ElementType } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import React from "react";

export type StateBase = {
    history: HistoryState<DiagramState>;
    diagramStateContext: DiagramStateContext;
    wordViewContext: WordViewContext;
    popupMenu?: DeriveMenu;
}

export type EditState = StateBase & {
    type: "edit";
    editHistory: HistoryState<DiagramState>;
    id: ElementId;
    property?: string;
}

export type BrowseState = StateBase & {
    type: "browse";
}

export type AddToParent = {
    id: ElementId;
    type: Exclude<ElementType, "word">;
    property: string | string[];
}

export type AddToState = StateBase & {
    type: "add to";
    childId: ElementId;
    parent?: AddToParent;
}

export type State =  EditState | BrowseState | AddToState;

export type DeriveMenu = {
    type: "derive";
    deriveId: ElementId;
    derivationTree: DerivationTree;
}

export type Action = {
    type: "edit: Enter";
    id: ElementId;
} | {
    type: "edit: Done";
} | {
    type: "edit: Cancel";
} | {
    type: "edit: Submit Change";
    change: AtomicChange[];
} | {
    type: "wordViewContext: category";
    category: WordViewCategory;
} | {
    type: "wordViewContext: selectedItem";
    selectedNode: SelectNode | undefined;
} | {
    type: "edit: Add child reference";
    property: string;
    childId: ElementId;
} | {
    type: "edit: Remove child reference";
    property: string;
    childId: ElementId;
} | {
    type: "edit: Select property";
    property: string | undefined;
} | {
    type: "derive: Enter";
    deriveId: ElementId;
    deriveType: ElementType;
} | {
    type: "derive: Cancel";
} | {
    type: "derive: Done";
    targetType: Exclude<ElementType, "word">;
    targetProperty: string;
} | {
    type: "add to: Enter";
    id: ElementId;
} | {
    type: "add to: Cancel";
} | {
    type: "add to: Done";
} | {
    type: "add to: Set Parent";
    parent: AddToParent | undefined;
}

export type Reducer = (state: State, action: Action) => State;

export interface WordViewAssemblyContext {
    state: State;
    dispatch: React.Dispatch<Action>;
}

export const WordViewAssemblyContext = React.createContext<WordViewAssemblyContext>({
    state: "not implemented" as unknown as State,
    dispatch: () => { throw "unimplemented"; }
});