import React, { Dispatch, SetStateAction } from "react";
import { makeRefComponent, RefComponent, withClassName, withEventListener } from "@app/utils/hoc";
import { WordView } from "../WordView/WordView";
import { ElementType, getElementDefinition } from "@domain/language";
import { useReducer } from "react";
import { accessClassName, DerivationTree, DiagramState, DiagramStateContext, DisplayModel, SelectNode, HistoryState, WordViewContext } from "@app/utils";
import { Action, AddToState, BrowseState, EditState, Reducer, State } from "./types";
import { getBrowseBuildFn } from "./browse";
import { getEditBuildFn } from "./edit";
import { PropertySelector } from "../PropertySelector";
import { AtomicChange } from "@lib/utils";
import { ButtonBar, ButtonBarProps } from "@app/basic-components";
import { DerivationTreeMenu } from "../DerivationTreeMenu";
import styles from "./_styles.scss";
import { SelectedItemParent } from "@app/basic-components/SelectedItemParent";
import { AddToButtonBar, getAddToBuildFunction } from "./addTo";
import { Ids } from "@app/testing";

export interface WordViewAssemblyProps {
    diagram: DiagramState;
    setDiagram: Dispatch<SetStateAction<DiagramState>>;
}

type EditButtonBarItems = ["Done", "Cancel"];

const Empty: React.VFC = () => <></>;

function withAppend(Component: React.VFC, AppendComponent: React.VFC): React.VFC {
    const output: React.VFC = () => (
        <>
            <Component/>
            <AppendComponent/>
        </>
    );
    output.displayName = `${Component.displayName} + ${AppendComponent.displayName}`;
    return output;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "edit: Enter": {
            const browseState = state as BrowseState;
            const editHistory = HistoryState.createChild(browseState.history);
            const selectedNode = browseState.wordViewContext.selectedNode;
            if (selectedNode === undefined) {
                throw "selectedItem cannot be undefined";
            }
            return {
                type: "edit",
                id: action.id,
                history: browseState.history,
                wordViewContext: {
                    ...browseState.wordViewContext,
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
            const editState = state as EditState;
            const editHistory = HistoryState.stageChange(editState.editHistory);
            return {
                type: "edit",
                history: editState.history,
                editHistory: editHistory,
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                diagramStateContext: createDiagramStateContext(editHistory.currState)
            };
        }
        case "edit: Done": {
            const editState = state as EditState;
            const acceptHistory = HistoryState.importChild(
                editState.history,
                HistoryState.stageChange(
                    editState.editHistory,
                    ...DiagramState.createDeleteEmptyElements(
                        editState.diagramStateContext.state
                    )
                )
            );
            const acceptState: BrowseState = {
                type: "browse",
                history: acceptHistory,
                diagramStateContext: createDiagramStateContext(acceptHistory.currState),
                wordViewContext: editState.wordViewContext
            };
            return acceptState;
        }
        case "edit: Cancel": {
            const editState = state as EditState;
            return {
                type: "browse",
                history: editState.history,
                diagramStateContext: createDiagramStateContext(editState.editHistory.baseState),
                wordViewContext: editState.wordViewContext
            };
        }
        case "edit: Add child reference": {
            const editState = state as EditState;
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
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit: Remove child reference": {
            const editState = state as EditState;
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
                history: editState.history,
                editHistory: editHistory,
                diagramStateContext: createDiagramStateContext(editHistory.currState),
                wordViewContext: editState.wordViewContext,
                id: editState.id,
                property: action.property
            };
        }
        case "edit: Select property": {
            const editState = state as EditState;
            return {
                ...editState,
                property: action.property
            };
        }
        case "wordViewContext: category": {
            return {
                ...state,
                wordViewContext: {
                    category: action.category
                }
            };
        }
        case "wordViewContext: selectedItem": {
            const newWVContext: WordViewContext = {
                category: state.wordViewContext.category
            };
            if (action.selectedNode !== undefined) {
                newWVContext.selectedNode = action.selectedNode;
            }
            return {
                ...state,
                wordViewContext: newWVContext
            };
        }
        case "derive: Enter": {
            const derivTree = DerivationTree.getDerivationTree(action.deriveType);
            if (derivTree === undefined) {
                throw `Derivation tree does not exist for type '${action.deriveType}'`;
            }
            const { selectedNode } = state.wordViewContext;
            const newSelectedNode = selectedNode === undefined
                ? undefined
                : SelectNode.getParent(
                    state.diagramStateContext.state,
                    selectedNode.id
                );
            return {
                ...state,
                popupMenu: {
                    type: "derive",
                    deriveId: action.deriveId,
                    derivationTree: derivTree
                },
                wordViewContext: {
                    ...state.wordViewContext,
                    selectedNode: newSelectedNode
                }
            };
        }
        case "derive: Cancel": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { popupMenu, ...baseState } = state;
            return baseState;
        }
        case "derive: Done": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { popupMenu, diagramStateContext, history, ...baseState } = state;
            if (popupMenu === undefined) {
                throw "unhandled state. popupMenu required";
            }
            const [itemId, addItem] = DiagramState.createAddItem(action.targetType);
            let newHistory = HistoryState.stageChange(history, addItem);
            newHistory = HistoryState.stageChange(
                newHistory,
                ...DiagramState.createAddReference(
                    newHistory.currState,
                    action.targetType,
                    itemId,
                    action.targetProperty,
                    popupMenu.deriveId
                )
            );
            return {
                ...baseState,
                history: newHistory,
                diagramStateContext: createDiagramStateContext(newHistory.currState)
            };
        }
        case "add to: Enter": {
            return {
                ...state,
                type: "add to",
                childId: action.id
            };
        }
        case "add to: Cancel": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { childId: id, type, ...rest } = state as AddToState;
            return {
                ...rest,
                type: "browse"
            };
        }
        case "add to: Done": {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { parent, childId, history } = state as AddToState;
            if (parent === undefined) {
                throw "no parent selected";
            }
            if (Array.isArray(parent.property)) {
                throw "Can only assign to single property";
            }
            const newHistory = HistoryState.stageChange(
                history,
                ...DiagramState.createAddReference(
                    history.currState,
                    parent.type,
                    parent.id,
                    parent.property,
                    childId
                )
            );
            const newWordViewContext: WordViewContext = { ...state.wordViewContext };
            delete newWordViewContext.selectedNode;
            return {
                type: "browse",
                history: newHistory,
                diagramStateContext: createDiagramStateContext(newHistory.currState),
                wordViewContext: newWordViewContext
            };
        }
        case "add to: Set Parent": {
            const output = { ...state } as AddToState;
            const { parent } = action;
            if (parent === undefined) {
                delete output.parent;
            } else {
                output.parent = parent;
            }
            return output;
        }
    }
}

function initializer(diagram: DiagramState): State {
    const change = DiagramState.createTypedDeleteReference(
        diagram,
        "independentClause",
        Ids.indClause,
        "predicate",
        Ids.jumpsVerbPhrase
    );
    const newDiagram = AtomicChange.apply(diagram, ...change);
    return {
        type: "add to",
        history: HistoryState.init(newDiagram),
        diagramStateContext: createDiagramStateContext(newDiagram),
        childId: Ids.jumpsVerbPhrase,
        wordViewContext: {
            selectedNode: { id: Ids.jumpsVerbPhrase, type: "verbPhrase", state: "select" },
            category: "phraseAndClause"
        }
    };
}

function createDiagramStateContext(diagram: DiagramState): DiagramStateContext {
    const model = DisplayModel.init(diagram);
    return {
        state: diagram,
        model: model,
        progress: DisplayModel.calcProgress(model)
    };
}

function createEditButtonBarBuildFn(dispatch: Dispatch<Action>): Exclude<ButtonBarProps["buildFn"], undefined> {
    return (Component, item) => {
        switch (item) {
            case "Done":
                return withEventListener(Component, "click", () => dispatch({
                    type: "edit: Done"
                }));
            case "Cancel":
                return withEventListener(Component, "click", () => dispatch({
                    type: "edit: Cancel"
                }));
            default:
                throw `Unhandled state '${item}'`;
        }
    };
}

function encloseBody(Body: React.VFC): RefComponent<HTMLDivElement> {
    return makeRefComponent<HTMLDivElement>("enclose", (_, ref) => (
        <div ref={ref}>
            <Body/>
        </div>
    ));
}

function addDerivationTreeMenu<TElement extends HTMLElement>(Body: RefComponent<TElement>, tree: DerivationTree, dispatch: React.Dispatch<Action>): RefComponent<TElement> {
    const DisabledBody = withClassName(Body, accessClassName(styles, "disable"));
    return makeRefComponent<TElement>("deriveMenu", (_, ref) => (
        <>
            <DerivationTreeMenu
                onSelect={(tgt) => dispatch({
                    type: "derive: Done",
                    targetType: tgt.type,
                    targetProperty: tgt.property
                })}
                onCancel={() => dispatch({ type: "derive: Cancel" })}
            >
                {tree}
            </DerivationTreeMenu>
            <DisabledBody ref={ref}/>
        </>
    ));
}

function createSelectedItemParent(dispatch: React.Dispatch<Action>): React.VFC {
    const output: React.VFC = () => (
        <div className={accessClassName(styles, "selectedItemParent")}>
            <SelectedItemParent
                onUpLevel={(parent) => dispatch({
                    type: "wordViewContext: selectedItem",
                    selectedNode: parent
                })}
            />
        </div>
    );
    output.displayName = SelectedItemParent.displayName;
    return output;
}

export const WordViewAssembly = makeRefComponent<HTMLDivElement, WordViewAssemblyProps>("WordViewAssembly", ({ diagram, setDiagram }, ref) => {
    const [state, dispatch] = useReducer<Reducer, DiagramState>(reducer, diagram, initializer);

    let Body = Empty;
    const SelectedItem = createSelectedItemParent(dispatch);
    switch (state.type) {
        case "browse":
            const browse: React.VFC = () => (
                <DiagramStateContext.Provider value={state.diagramStateContext}>
                    <WordViewContext.Provider value={state.wordViewContext}>
                        <SelectedItem/>
                        <WordView buildFn={getBrowseBuildFn(state, dispatch)}/>
                    </WordViewContext.Provider>
                </DiagramStateContext.Provider>
            );
            browse.displayName = "Browse";
            Body = withAppend(Body, browse);
            break;
        case "edit":
            const bbItems: EditButtonBarItems = ["Done", "Cancel"];
            const buildFn = createEditButtonBarBuildFn(dispatch);
            const edit: React.VFC = () => (
                <DiagramStateContext.Provider value={state.diagramStateContext}>
                    <WordViewContext.Provider value={state.wordViewContext}>
                        <SelectedItem/>
                        <WordView buildFn={getEditBuildFn(state, dispatch)}/>
                        <PropertySelector
                            item={DiagramState.getItem(state.diagramStateContext.state, state.id)}
                            selectedProperty={state.property}
                            onSelectChange={(prop) => {
                                dispatch({
                                    type: "edit: Select property",
                                    property: prop
                                });
                            }}
                        />
                        <ButtonBar buildFn={buildFn}>{bbItems}</ButtonBar>
                    </WordViewContext.Provider>
                </DiagramStateContext.Provider>
            );
            edit.displayName = "Edit";
            Body = withAppend(Body, edit);
            break;
        case "add to":
            const addTo: React.VFC = () => (
                <DiagramStateContext.Provider value={state.diagramStateContext}>
                    <WordViewContext.Provider value={state.wordViewContext}>
                        <WordView buildFn={getAddToBuildFunction(state, dispatch)}/>
                        <AddToButtonBar state={state} dispatch={dispatch}/>
                    </WordViewContext.Provider>
                </DiagramStateContext.Provider>
            );
            addTo.displayName = "Add To";
            Body = withAppend(Body, addTo);
            break;
    }
    let EnclosedBody = encloseBody(Body);
    const popupMenu = state.popupMenu;
    if (popupMenu !== undefined) {
        EnclosedBody = addDerivationTreeMenu(
            EnclosedBody,
            popupMenu.derivationTree,
            dispatch
        );
    }
    return (
        <div ref={ref}>
            <EnclosedBody/>
        </div>
    );
});