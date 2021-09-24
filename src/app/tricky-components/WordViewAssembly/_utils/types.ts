import { DiagramState, DiagramStateContext, HistoryState, WordViewContext, WordViewMode } from "@app/utils";
import { ElementCategory, ElementId, ElementType } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import React from "react";

export interface StateBase {
    type: WordViewMode;
    history: HistoryState<DiagramState>;
    diagramStateContext: DiagramStateContext;
    wordViewContext: WordViewContext;
}

export interface TypedStateBase<T extends WordViewMode> extends StateBase {
    type: T;
}

export type NavigateState = TypedStateBase<"navigate">;

export interface LabelState extends TypedStateBase<"label"> {
    labelType?: Exclude<ElementType, "word">;
}

export interface EditBrowseState extends TypedStateBase<"edit"> {
    editState: "browse";
}

export interface EditActiveState extends TypedStateBase<"edit"> {
    editState: "active";
    editHistory: HistoryState<DiagramState>;
    id: ElementId;
    property?: string;
}

export type EditState = EditBrowseState | EditActiveState;

export type DeleteState = TypedStateBase<"delete">;

export type State =  NavigateState | LabelState | EditState | DeleteState;

export type Action = {
    type: "switch mode";
    target: WordViewMode;
} | {
    type: "navigate: selectedItem";
    selectedElement: ElementId | undefined;
} | {
    type: "navigate: elementCategory";
    elementCategory: ElementCategory;
} | {
    type: "label: labelType";
    labelType: Exclude<ElementType, "word"> | undefined;
} | {
    type: "label: Apply";
    id: ElementId;
} | {
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
    type: "delete";
    id: ElementId;
}

export interface WordViewAssemblyContext {
    state: State;
    dispatch: React.Dispatch<Action>;
}

export const WordViewAssemblyContext = React.createContext<WordViewAssemblyContext>({
    state: "not implemented" as unknown as State,
    dispatch: () => { throw "unimplemented"; }
});