import { DerivationTree, DiagramState, LabelFormMode } from "@app/utils";
import { Element, ElementId, ElementType } from "@domain/language";
import React from "react";
import { AddMenuProps } from "../AddMenu";
import { DeleteMenuProps } from "../DeleteMenu";
import { EditActiveMenuDispatch } from "../EditActiveMenu";
import { EditActiveMenuInterfaceProps } from "../EditActiveMenuInterface";
import { EditBrowseMenuProps } from "../EditBrowseMenu";
import { NavigateMenuProps } from "../NavigateMenu";
import { LabelViewNavBarAssemblyProps } from "../LabelViewNavBarAssembly";
import { State, LabelFormAction, EditActiveState, DisplaySettings } from "./types";
import { Utils } from "./utils";

export function createEditActiveDispatch(dispatch: React.Dispatch<LabelFormAction>): EditActiveMenuDispatch {
    return (action) => {
        switch (action.type) {
            case "submit":
                dispatch({
                    type: "edit.active: submit"
                });
                break;
            case "close":
                dispatch({
                    type: "edit.active: cancel"
                });
                break;
            case "property select":
                dispatch({
                    type: "edit.active: edit property",
                    property: action.property
                });
                break;
            case "exit edit":
                dispatch({
                    type: "edit.active: edit property",
                    property: undefined
                });
                break;
            case "property delete":
                dispatch({
                    type: "edit.active: delete property",
                    property: action.property
                });
                break;
        }
    };
}

export function createOnModeChange(state: State, dispatch: React.Dispatch<LabelFormAction>): (newMode: LabelFormMode) => void {
    if (state.mode === "edit.active") {
        return (newMode) => {
            if (newMode === "edit.active") {
                throw "Cannot switch to present mode";
            }
            dispatch({
                type: "edit.active: switch mode",
                target: newMode
            });
        };
    }
    return (newMode) => {
        if (newMode === "edit.active") {
            const dispatchType: LabelFormAction["type"] = "edit.active: switch mode";
            throw `Cannot switch to '${newMode}' via '${dispatchType}' action`;
        }
        dispatch({
            type: "switch mode",
            target: newMode
        });
    };
}

export function convertToMenuProps(state: State, dispatch: React.Dispatch<LabelFormAction>): LabelViewNavBarAssemblyProps["props"] {
    switch (state.mode) {
        case "navigate": {
            const output: NavigateMenuProps = {
                category: state.display.category,
                onCategoryChange: (cat) => dispatch({
                    type: "navigate: category",
                    category: cat
                }),
                onUpLevel: () => dispatch({ type: "navigate: up" }),
                enableUpLevel: !!state.display.expanded
            };
            return output;
        }
        case "add": {
            const elements = getAddMenuElements(state.diagram, state.display);
            const output: AddMenuProps = {
                children: elements,
                onElementSelect: (element) => dispatch({
                    type: "add: edit.active",
                    elementType: element
                })
            };
            return output;
        }
        case "edit.browse": {
            const output: EditBrowseMenuProps = {};
            return output;
        }
        case "edit.active": {
            const item = DiagramState.getItem(state.diagram, state.id);
            if (item.type === "word") {
                const word: ElementType = "word";
                throw `Cannot edit '${word}' element`;
            }
            const output: EditActiveMenuInterfaceProps = {
                type: item.type,
                value: item.value as Element,
                property: state.property,
                dispatch: createEditActiveDispatch(dispatch)
            };
            return output;
        }
        case "delete": {
            const { showPrompt, allowDeleteAll } = state;
            const output: DeleteMenuProps = {
                showPrompt,
                allowDeleteAll,
                onDeleteAll: () => dispatch({ type: "delete: enter delete all" }),
                onDeleteAllYes: () => dispatch({ type: "delete: delete all yes" }),
                onDeleteAllCancel: () => dispatch({ type: "delete: delete all cancel" })
            };
            return output;
        }
    }
}

function getEditSelectType(state: EditActiveState, childId: ElementId): "1st reference" | "2nd reference" | "de-reference" {
    const { diagram, property } = state;
    if (property === undefined) {
        throw "no active property";
    }
    const childItem = DiagramState.getItem(diagram, childId);
    if (childItem.ref === undefined) {
        return "1st reference";
    }
    const parentId = state.id;
    const parentItem = DiagramState.getItem(diagram, parentId);
    if (parentItem.type === "word") {
        throw "cannot edit a word";
    }
    const referencedProperties = DiagramState.getReferencingProperties(
        parentItem.type,
        parentItem.value,
        childId
    );
    switch (typeof referencedProperties) {
        case "string":
            return referencedProperties === property
                ? "de-reference" : "2nd reference";
        case "object":
            return "de-reference";
        case "undefined":
            return "1st reference";
    }
}

export function createOnLabelClick(state: State, dispatch: React.Dispatch<LabelFormAction>): (id: ElementId) => void {
    switch (state.mode) {
        case "navigate":
            return (id) => dispatch({
                type: "navigate: expanded",
                expanded: id
            });
        case "edit.browse": {
            return (id) => {
                const { diagram } = state;
                const { type } = DiagramState.getItem(diagram, id);
                if (type === "word") {
                    return;
                }
                dispatch({
                    type: "edit.browse: edit.active",
                    id: id
                });
            };
        }
        case "edit.active": {
            const { property } = state;
            if (property === undefined) {
                return () => { return; };
            } else {
                return (id) => {
                    const selectType = getEditSelectType(state, id);
                    switch (selectType) {
                        case "1st reference":
                        case "2nd reference":
                            dispatch({
                                type: "edit.active: add reference",
                                property,
                                id
                            });
                            break;
                        case "de-reference":
                            dispatch({
                                type: "edit.active: remove reference",
                                property,
                                id
                            });
                            break;
                    }
                };
            }
        }
        case "delete": {
            return (id) => {
                const { diagram } = state;
                const { type } = DiagramState.getItem(diagram, id);
                if (type === "word") {
                    return;
                }
                dispatch({
                    type: "delete: element",
                    id: id
                });
            };
        }
    }
    return () => { return; };
}

function getAddMenuElements(diagram: DiagramState, display: DisplaySettings): Exclude<ElementType, "word">[] {
    const visibleElementTypes = Utils.getLabelData(diagram, display)
        .filter(Utils.isElementLabel)
        .filter(({ id }) => DiagramState.getItem(diagram, id).ref === undefined)
        .map(({ id }) => DiagramState.getItem(diagram, id).type);
    const output = DerivationTree.getElements(visibleElementTypes);
    return output;
}