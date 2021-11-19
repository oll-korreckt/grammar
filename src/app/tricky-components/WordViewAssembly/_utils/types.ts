import { PropertyEditorState } from "@app/tricky-components/PropertyEditor/PropertyEditor";
import { DiagramState, DiagramStateContext, HistoryState, WordViewContext, WordViewMode } from "@app/utils";
import { ElementCategory, ElementId, ElementType } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import React from "react";

export interface StateBase {
    type: WordViewMode;
    history: HistoryState<DiagramState>;
    diagramStateContext: DiagramStateContext;
    wordViewContext: WordViewContext;
    addElementType: Exclude<ElementType, "word"> | undefined;
}

export interface TypedStateBase<T extends WordViewMode> extends StateBase {
    type: T;
}

export type NavigateState = TypedStateBase<"navigate">;

export type AddState = TypedStateBase<"add">;

export type EditBrowseState = TypedStateBase<"edit.browse">;

type PriorStateData = {
    type: Extract<WordViewMode, "add">;
    contextData: Omit<WordViewContext, "visibleElements">;
} | {
    type: Extract<WordViewMode, "edit.browse">;
    contextData: Omit<WordViewContext, "visibleElements">;
}

export interface EditActiveState extends TypedStateBase<"edit.active"> {
    priorState: PriorStateData;
    editHistory: HistoryState<DiagramState>;
    id: ElementId;
    editMenuState: PropertyEditorState;
}

export type EditState = EditBrowseState | EditActiveState;

export type DeleteState = TypedStateBase<"delete">;

export type State =  NavigateState | AddState | EditState | DeleteState;

export type Action = {
    type: "switch mode";
    target: Exclude<WordViewMode, "edit.active">;
} | {
    type: "navigate: selectedItem";
    selectedElement: ElementId | undefined;
} | {
    type: "navigate: elementCategory";
    elementCategory: ElementCategory;
} | {
    type: "add: Enter edit.active";
    elementType: Exclude<ElementType, "word">;
} | {
    type: "edit.browse: Enter edit.active";
    id: ElementId;
} | {
    type: "edit.active: Done";
} | {
    type: "edit.active: Cancel";
} | {
    type: "edit.active: Delete property";
    property: string;
} | {
    type: "edit.active: Add child reference";
    property: string;
    childId: ElementId;
} | {
    type: "edit.active: Remove child reference";
    property: string;
    childId: ElementId;
} | {
    type: "edit.active: Select property";
    property: string | undefined;
} | {
    type: "edit.active: Switch mode";
    target: Exclude<WordViewMode, "edit.active">;
} | {
    type: "delete: element";
    id: ElementId;
} | {
    type: "delete: all";
}

export interface WordViewAssemblyContext {
    state: State;
    dispatch: React.Dispatch<Action>;
}

export const WordViewAssemblyContext = React.createContext<WordViewAssemblyContext>({
    state: "not implemented" as unknown as State,
    dispatch: () => { throw "unimplemented"; }
});