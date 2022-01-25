
import { DiagramState, DiagramStateFunctions, LabelFormMode } from "@app/utils";
import { ElementCategory, ElementId } from "@domain/language";
import { SimpleObject } from "@lib/utils";
import React, { useReducer } from "react";
import { State, AddState, DeleteState, EditActiveState, EditBrowseState, NavigateState, LabelFormAction, LabelFormProps, DiagramChange, DisplaySettings } from "./types";

function switchMode(state: State, target: Exclude<LabelFormMode, "edit.active">): State {
    if (state.mode === "edit.active") {
        const actionName: LabelFormAction["type"] = "switch mode";
        const mode: LabelFormMode = "edit.active";
        throw `'${actionName}' is not intended for switching out of '${mode}'`;
    }
    const mixin: Pick<State, "diagram" | "display"> = {
        diagram: state.diagram,
        display: state.display
    };
    switch (target) {
        case "navigate":
            return {
                ...mixin,
                mode: "navigate"
            };
        case "add":
            return {
                ...mixin,
                mode: "add"
            };
        case "edit.browse":
            return {
                ...mixin,
                mode: "edit.browse"
            };
        case "delete":
            return {
                ...mixin,
                mode: "delete"
            };
    }
}

function getPriorMode({ priorMode, diagram }: EditActiveState): AddState | EditBrowseState {
    if (priorMode !== undefined) {
        return priorMode;
    }
    return {
        mode: "add",
        diagram: diagram,
        display: {}
    };
}

function editActiveSwitchMode(state: EditActiveState, target: Exclude<LabelFormMode, "edit.active">): State {
    const priorMode = getPriorMode(state);
    switch (target) {
        case "navigate":
            return {
                mode: "navigate",
                diagram: priorMode.diagram,
                display: priorMode.display
            };
        case "add":
            return {
                mode: "add",
                diagram: priorMode.diagram,
                display: priorMode.display
            };
        case "edit.browse":
            return {
                mode: "edit.browse",
                diagram: priorMode.diagram,
                display: priorMode.display
            };
        case "delete":
            return {
                mode: "delete",
                diagram: priorMode.diagram,
                display: priorMode.display
            };
    }
}

function createDisplaySettings(category: ElementCategory | undefined, expanded: ElementId | undefined ): DisplaySettings {
    const output: DisplaySettings = {};
    if (category !== undefined) {
        output.category = category;
    }
    if (expanded !== undefined) {
        output.expanded = expanded;
    }
    return output;
}

type StateMapper<T extends LabelFormMode> =
    T extends "navigate" ? NavigateState
        : T extends "add" ? AddState
        : T extends "edit.browse" ? EditBrowseState
        : T extends "edit.active" ? EditActiveState
        : T extends "delete" ? DeleteState
        : never;

function castState<T extends LabelFormMode>(mode: T, state: State): StateMapper<T> {
    if (mode !== state.mode) {
        throw "";
    }
    return state as any;
}

function getUpExpanded(diagram: DiagramState, display: DisplaySettings): ElementId | undefined {
    if (display.expanded === undefined) {
        throw "cannot navigate up if no element is expanded";
    }
    const expandedItem = DiagramState.getItem(diagram, display.expanded);
    if (expandedItem.ref === undefined) {
        return undefined;
    }
    const parentItem = DiagramState.getItem(diagram, expandedItem.ref);
    const category = ElementCategory.getDefault(display.category);
    const categoryFilter = ElementCategory.getLayerFilter(category);
    const parentCategory = ElementCategory.getElementCategory(parentItem.type);
    return categoryFilter(parentCategory) ? expandedItem.ref : undefined;
}

function reducerFn(state: State, action: LabelFormAction, onDiagramChange?: DiagramChange | undefined): State {
    const invokeDiagramChange: DiagramChange = (newDiagram) => {
        if (onDiagramChange === undefined) {
            return;
        }
        onDiagramChange(newDiagram);
    };
    switch (action.type) {
        case "switch mode": {
            return switchMode(state, action.target);
        }
        case "navigate: category": {
            return {
                ...state,
                display: createDisplaySettings(
                    action.category,
                    undefined
                )
            };
        }
        case "navigate: expanded": {
            return {
                ...state,
                display: createDisplaySettings(
                    state.display.category,
                    action.expanded
                )
            };
        }
        case "navigate: up": {
            const { diagram, display } = state;
            const expanded = getUpExpanded(diagram, display);
            return {
                ...state,
                display: createDisplaySettings(
                    display.category,
                    expanded
                )
            };
        }
        case "add: edit.active": {
            const [newId, newDiagram] = DiagramStateFunctions.addItem(state.diagram, action.elementType);
            return {
                mode: "edit.active",
                diagram: newDiagram,
                display: {
                    ...state.display,
                    expanded: newId
                },
                id: newId,
                priorMode: {
                    mode: "add",
                    display: state.display,
                    diagram: state.diagram
                }
            };
        }
        case "edit.browse: edit.active": {
            return {
                mode: "edit.active",
                diagram: SimpleObject.clone(state.diagram),
                display: {
                    ...state.display,
                    expanded: action.id
                },
                id: action.id,
                priorMode: {
                    mode: "edit.browse",
                    diagram: state.diagram,
                    display: state.display
                }
            };
        }
        case "edit.active: submit": {
            const { priorMode } = castState("edit.active", state);
            if (priorMode === undefined) {
                throw "no prior mode provided";
            }
            invokeDiagramChange(state.diagram);
            return {
                ...priorMode,
                diagram: state.diagram
            };
        }
        case "edit.active: cancel": {
            const { priorMode } = castState("edit.active", state);
            if (priorMode === undefined) {
                throw "no prior mode provided";
            }
            return priorMode;
        }
        case "edit.active: delete property": {
            const editActive = castState("edit.active", state);
            const diagram = DiagramStateFunctions.deleteProperty(
                editActive.diagram,
                editActive.id,
                action.property
            );
            return {
                ...editActive,
                diagram
            };
        }
        case "edit.active: edit property": {
            const editActive = castState("edit.active", state);
            const output: EditActiveState = {
                ...editActive,
                property: action.property
            };
            if (output.property === undefined) {
                delete output.property;
            }
            return output;
        }
        case "edit.active: add reference": {
            const editActive = castState("edit.active", state);
            const diagram = DiagramStateFunctions.addReference(
                editActive.diagram,
                editActive.id,
                action.property,
                action.id
            );
            const output: EditActiveState = {
                ...editActive,
                diagram
            };
            return output;
        }
        case "edit.active: remove reference": {
            const editActive = castState("edit.active", state);
            const diagram = DiagramStateFunctions.deleteReference(
                editActive.diagram,
                editActive.id,
                action.property,
                action.id,
                true
            );
            const output: EditActiveState = {
                ...editActive,
                diagram
            };
            return output;
        }
        case "edit.active: switch mode": {
            const editActive = castState("edit.active", state);
            return editActiveSwitchMode(editActive, action.target);
        }
        case "delete: element": {
            const newDiagram = DiagramStateFunctions.deleteItem(state.diagram, action.id);
            invokeDiagramChange(newDiagram);
            return {
                ...state,
                diagram: newDiagram
            };
        }
        case "delete: all": {
            const newDiagram = DiagramStateFunctions.deleteAll(state.diagram);
            invokeDiagramChange(newDiagram);
            return {
                ...state,
                diagram: newDiagram,
                display: {}
            };
        }
    }
}

function initializer({ initialDiagram, initialMode, initialDisplay }: LabelFormProps): State {
    function getMode(): LabelFormMode {
        return initialMode !== undefined ? initialMode : "navigate";
    }
    function getDiagram(): DiagramState {
        return initialDiagram !== undefined
            ? initialDiagram
            : DiagramState.initEmpty();
    }
    function getDisplay(): DisplaySettings {
        return initialDisplay !== undefined ? initialDisplay : {};
    }

    return {
        mode: getMode(),
        diagram: getDiagram(),
        display: getDisplay()
    } as any;
}

function createReducer(onDiagramChange: DiagramChange | undefined): React.Reducer<State, LabelFormAction> {
    return (state, action) => reducerFn(state, action, onDiagramChange);
}

export function useLabelForm(props: LabelFormProps): [State, React.Dispatch<LabelFormAction>] {
    const reducer = createReducer(props.onDiagramChange);
    return useReducer(reducer, props, initializer);
}