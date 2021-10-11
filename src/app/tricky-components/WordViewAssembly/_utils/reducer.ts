import { createWordViewContext, DiagramState, DiagramStateContext, DisplayModel, ElementDisplayInfo, HistoryState, WordViewContext, WordViewMode } from "@app/utils";
import { ElementCategory, ElementType, getElementDefinition } from "@domain/language";
import { AtomicChange } from "@lib/utils";
import React, { useReducer } from "react";
import { Action, EditActiveState, AddState, State, StateBase, EditBrowseState } from "./types";

function extractCancelData(state: EditActiveState): Omit<StateBase, "type"> {
    const diagramStateContext = createDiagramStateContext(state.history.currState);
    const { priorState } = state;
    const wordViewContext = createWordViewContext(
        diagramStateContext,
        priorState.contextData.elementCategory,
        priorState.contextData.selectedElement
    );
    return {
        history: state.history,
        diagramStateContext: diagramStateContext,
        wordViewContext: wordViewContext,
        addElementType: state.addElementType
    };
}

function switchMode(state: Omit<StateBase, "type">, mode: Exclude<WordViewMode, "edit.active">): Exclude<State, EditActiveState> {
    const keys: (keyof Omit<StateBase, "type">)[] = [
        "history",
        "diagramStateContext",
        "wordViewContext",
        "addElementType"
    ];
    const output: Partial<Exclude<State, EditActiveState>> = {};
    keys.forEach((key) => output[key] = state[key] as any);
    output.type = mode;
    return output as Exclude<State, EditActiveState>;
}

function checkEditActive(state: State): EditActiveState {
    if (state.type !== "edit.active") {
        throw "invalid state";
    }
    return state as EditActiveState;
}

function extractContextData(context: WordViewContext): Omit<WordViewContext, "visibleElements"> {
    const output: Omit<WordViewContext, "visibleElements"> = {
        elementCategory: context.elementCategory
    };
    if (context.selectedElement !== undefined) {
        output.selectedElement = context.selectedElement;
    }
    return output;
}

function getElementCategory(elementType: Exclude<ElementType, "word">): ElementCategory {
    const def = getElementDefinition(elementType);
    const propTypes = Object.values(def).map(([, types]) => types).flat();
    const uniquePropTypes = Array.from(new Set<ElementType>(propTypes));
    type CategoryLevel = { [Key in ElementCategory]: number; };
    const catLevels: CategoryLevel = {
        word: 0,
        partOfSpeech: 1,
        phrase: 2,
        clause: 3
    };
    const elementCat = ElementCategory.getElementCategory(elementType);
    const elementCatLvl = catLevels[elementCat];
    let maxCat: ElementCategory | undefined = undefined;
    let maxCatLvl: number | undefined = undefined;
    for (let index = 0; index < uniquePropTypes.length; index++) {
        const propType = uniquePropTypes[index];
        const propCat = ElementCategory.getElementCategory(propType);
        const propCatLvl = catLevels[propCat];
        if (maxCatLvl === undefined
            || propCatLvl > maxCatLvl) {
            maxCat = propCat;
            maxCatLvl = propCatLvl;
        }
        if (maxCatLvl === 3) {
            break;
        }
    }
    if (maxCat === undefined || maxCatLvl === undefined) {
        throw `No category found for '${elementType}'`;
    }
    return maxCatLvl > elementCatLvl ? maxCat : elementCat;
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
        case "add: Enter edit.active": {
            const { wordViewContext, history } = state as AddState;
            const addElementType = action.elementType;
            if (addElementType === undefined) {
                throw "cannot apply label without labelType selected";
            }
            const [newItemId, change] = DiagramState.createAddItem(addElementType);
            let newHistory = HistoryState.stageChange(history, change);
            newHistory = HistoryState.stageChange(newHistory);
            return {
                type: "edit.active",
                addElementType: addElementType,
                priorState: {
                    type: "add",
                    contextData: extractContextData(wordViewContext)
                },
                history: newHistory,
                diagramStateContext: createDiagramStateContext(newHistory.currState),
                wordViewContext: wordViewContext,
                id: newItemId,
                editHistory: HistoryState.createChild(newHistory),
                property: ElementDisplayInfo.getPrimaryProperty(addElementType)
            };
        }
        case "edit.browse: Enter edit.active": {
            const editState = state as EditBrowseState;
            if (editState.type !== "edit.browse") {
                throw "invalid state";
            }
            const editHistory = HistoryState.createChild(editState.history);
            const elementType = DiagramState.getItem(editState.diagramStateContext.state, action.id).type;
            const newWordViewContext = createWordViewContext(
                editState.diagramStateContext,
                getElementCategory(elementType as Exclude<ElementType, "word">),
                action.id
            );
            return {
                type: "edit.active",
                addElementType: editState.addElementType,
                priorState: {
                    type: "edit.browse",
                    contextData: extractContextData(editState.wordViewContext)
                },
                id: action.id,
                history: editState.history,
                wordViewContext: newWordViewContext,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState)
            };
        }
        case "edit.active: Submit Change": {
            const editState = checkEditActive(state);
            const editHistory = HistoryState.stageChange(editState.editHistory);
            return {
                type: "edit.active",
                addElementType: editState.addElementType,
                priorState: editState.priorState,
                history: editState.history,
                editHistory: editHistory,
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                diagramStateContext: createDiagramStateContext(editHistory.currState)
            };
        }
        case "edit.active: Done": {
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
            const acceptDiagramState = createDiagramStateContext(acceptHistory.currState);
            const { priorState } = editState;
            const priorWordViewContext = createWordViewContext(
                acceptDiagramState,
                priorState.contextData.elementCategory,
                priorState.contextData.selectedElement
            );
            const data: Omit<StateBase, "type"> = {
                history: acceptHistory,
                diagramStateContext: acceptDiagramState,
                wordViewContext: priorWordViewContext,
                addElementType: editState.addElementType
            };
            return switchMode(data, editState.priorState.type);
        }
        case "edit.active: Cancel": {
            const editState = checkEditActive(state);
            const data = extractCancelData(editState);
            return switchMode(data, editState.priorState.type);
        }
        case "edit.active: Add child reference": {
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
                type: "edit.active",
                addElementType: editState.addElementType,
                priorState: editState.priorState,
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit.active: Remove child reference": {
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
                type: "edit.active",
                addElementType: editState.addElementType,
                priorState: editState.priorState,
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit.active: Select property": {
            const editState = checkEditActive(state);
            return {
                ...editState,
                property: action.property
            };
        }
        case "edit.active: Switch mode": {
            const editState = checkEditActive(state);
            const data = extractCancelData(editState);
            return switchMode(data, action.target);
        }
        case "delete: element": {
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
                addElementType: state.addElementType,
                history: newHistory,
                diagramStateContext: newDiagramStateContext,
                wordViewContext: createWordViewContext(newDiagramStateContext, elementCategory, selectedElement)
            };
        }
        case "delete: all": {
            const currState = state.diagramStateContext.state;
            const changes: AtomicChange[] = [];
            Object.entries(currState.elements).forEach(([key, element]) => {
                if (element.type !== "word") {
                    changes.push(AtomicChange.createDelete(
                        ["elements", key],
                        element
                    ));
                }
            });
            currState.wordOrder.forEach((id) => {
                const word = currState.elements[id];
                if (word.ref !== undefined) {
                    changes.push(AtomicChange.createDelete(
                        ["elements", id, "ref"],
                        word.ref
                    ));
                }
            });
            const newHistory = HistoryState.stageChange(
                state.history,
                ...changes
            );
            const newDiagramStateContext = createDiagramStateContext(newHistory.currState);
            const { elementCategory, selectedElement } = state.wordViewContext;
            return {
                type: "delete",
                addElementType: state.addElementType,
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
        type: "delete",
        addElementType: undefined,
        history: HistoryState.init(diagram),
        diagramStateContext: newDiagramStateContext,
        wordViewContext: createWordViewContext(newDiagramStateContext, "partOfSpeech")
    };
}

export function useWordViewAssembly(diagram: DiagramState): [State, React.Dispatch<Action>] {
    return useReducer(reducer, diagram, initializer);
}