import { createWordViewContext, DiagramState, DiagramStateContext, DisplayModel, HistoryState, WordViewContext, WordViewMode } from "@app/utils";
import { ElementType, getElementDefinition } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import React, { useReducer } from "react";
import { Action, EditActiveState, EditState, LabelState, State, StateBase } from "./types";

function switchMode(state: State, mode: WordViewMode): State {
    const stateBaseKeys: (keyof StateBase)[] = [
        "history",
        "diagramStateContext",
        "wordViewContext"
    ];
    const output: Partial<StateBase> = {};
    stateBaseKeys.forEach((key) => {
        output[key] = state[key] as any;
    });
    output.type = mode;
    return output as State;
}

function checkEditActive(state: State): EditActiveState {
    if ((state as EditState).editState !== "active") {
        throw "invalid state";
    }
    return state as EditActiveState;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "switch mode": {
            return switchMode(state, action.target);
        }
        case "navigate: selectedItem": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { visibleElements, elementCategory } = state.wordViewContext;
            const data: Omit<WordViewContext, "visibleElements"> = {
                elementCategory: elementCategory
            };
            if (action.selectedElement !== undefined) {
                data.selectedElement = action.selectedElement;
            }
            const newWVContext = createWordViewContext(state.diagramStateContext, elementCategory, action.selectedElement);
            return {
                ...state,
                wordViewContext: newWVContext
            };
        }
        case "navigate: elementCategory": {
            const newWVContext = createWordViewContext(state.diagramStateContext, action.elementCategory, undefined);
            return {
                ...state,
                wordViewContext: newWVContext
            };
        }
        case "label: labelType": {
            const output = { ...state as LabelState };
            if (action.labelType === undefined) {
                delete output.labelType;
            } else {
                output.labelType = action.labelType;
            }
            return output;
        }
        case "label: Apply": {
            const { wordViewContext, history, labelType } = state as LabelState;
            if (labelType === undefined) {
                throw "cannot apply label without labelType selected";
            }
            const [newItemId, change] = DiagramState.createAddItem(labelType);
            let newHistory = HistoryState.stageChange(history, change);
            newHistory = HistoryState.stageChange(
                newHistory,
                ...DiagramState.createAddReference(
                    newHistory.currState,
                    labelType,
                    newItemId,
                    "some property",
                    action.id
                )
            );
            return {
                type: "label",
                history: newHistory,
                diagramStateContext: createDiagramStateContext(newHistory.currState),
                wordViewContext: wordViewContext
            };
        }
        case "edit: Enter": {
            const editState = state as EditState;
            if (editState.editState !== "browse") {
                throw "invalid state";
            }
            const editHistory = HistoryState.createChild(editState.history);
            const selectedNode = editState.wordViewContext.selectedNode;
            if (selectedNode === undefined) {
                throw "selectedItem cannot be undefined";
            }
            return {
                type: "edit",
                editState: "active",
                id: action.id,
                history: editState.history,
                wordViewContext: {
                    ...editState.wordViewContext,
                    selectedNode: {
                        ...selectedNode,
                        state: "expand"
                    }
                },
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState)
            };
        }
        case "edit: Submit Change": {
            const editState = checkEditActive(state);
            const editHistory = HistoryState.stageChange(editState.editHistory);
            return {
                type: "edit",
                editState: "active",
                history: editState.history,
                editHistory: editHistory,
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                diagramStateContext: createDiagramStateContext(editHistory.currState)
            };
        }
        case "edit: Done": {
            const editState = checkEditActive(state);
            const acceptHistory = HistoryState.importChild(
                editState.history,
                HistoryState.stageChange(
                    editState.editHistory,
                    ...DiagramState.createDeleteEmptyElements(
                        editState.diagramStateContext.state
                    )
                )
            );
            const acceptState: EditState = {
                type: "edit",
                editState: "browse",
                history: acceptHistory,
                diagramStateContext: createDiagramStateContext(acceptHistory.currState),
                wordViewContext: editState.wordViewContext
            };
            return acceptState;
        }
        case "edit: Cancel": {
            const editState = checkEditActive(state);
            return {
                type: "edit",
                editState: "browse",
                history: editState.history,
                diagramStateContext: createDiagramStateContext(editState.editHistory.baseState),
                wordViewContext: editState.wordViewContext
            };
        }
        case "edit: Add child reference": {
            const editState = checkEditActive(state);
            const parentId = editState.id;
            const parentItem = DiagramState.getItem(editState.diagramStateContext.state, parentId);
            const parentType = parentItem.type as Exclude<ElementType, "word">;
            const [isArray] = getElementDefinition(parentType)[action.property];
            let change: AtomicChange[];
            if (isArray) {
                change = DiagramState.createAddReference(
                    editState.diagramStateContext.state,
                    parentType,
                    editState.id,
                    action.property,
                    action.childId
                );
            } else {
                const childType = DiagramState.getItem(
                    editState.diagramStateContext.state,
                    action.childId
                ).type;
                change = DiagramState.setReference(
                    editState.diagramStateContext.state,
                    parentType,
                    editState.id,
                    action.property,
                    { type: childType, id: action.childId }
                );
            }
            const editHistory = HistoryState.stageChange(editState.editHistory, ...change);
            return {
                type: "edit",
                editState: "active",
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit: Remove child reference": {
            const editState = checkEditActive(state);
            const parentId = editState.id;
            const parentType = DiagramState.getItem(editState.diagramStateContext.state, parentId).type as Exclude<ElementType, "word">;
            const change = DiagramState.createDeleteReference(
                editState.diagramStateContext.state,
                parentType,
                parentId,
                action.property,
                action.childId
            );
            const editHistory = HistoryState.stageChange(editState.editHistory, ...change);
            return {
                type: "edit",
                editState: "active",
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit: Select property": {
            const editState = checkEditActive(state);
            return {
                ...editState,
                property: action.property
            };
        }
        case "delete": {
            const currState = state.diagramStateContext.state;
            const change = DiagramState.createDeleteItem(currState, action.id);
            const newHistory = HistoryState.stageChange(
                state.history,
                ...change
            );
            const newDiagramStateContext = createDiagramStateContext(newHistory.currState);
            const { elementCategory, selectedElement } = state.wordViewContext;
            return {
                type: "delete",
                history: newHistory,
                diagramStateContext: newDiagramStateContext,
                wordViewContext: createWordViewContext(newDiagramStateContext, elementCategory, selectedElement)
            };
        }
    }
}

function createDiagramStateContext(diagram: DiagramState): DiagramStateContext {
    const model = DisplayModel.init(diagram);
    return {
        state: diagram,
        model: model,
        progress: DisplayModel.calcProgress(model)
    };
}

function initializer(diagram: DiagramState): State {
    const newDiagramStateContext = createDiagramStateContext(diagram);
    return {
        type: "navigate",
        history: HistoryState.init(diagram),
        diagramStateContext: newDiagramStateContext,
        wordViewContext: createWordViewContext(newDiagramStateContext, "clause")
    };
}

export function useWordViewAssembly(diagram: DiagramState): [State, React.Dispatch<Action>] {
    return useReducer(reducer, diagram, initializer);
}