import { DiagramState, WordViewMode } from "@app/utils";
import { Element, ElementId, ElementType } from "@domain/language";
import React from "react";
import { AddMenuProps } from "../AddMenu";
import { DeleteMenuProps } from "../DeleteMenu";
import { EditActiveMenuDispatch } from "../EditActiveMenu";
import { EditActiveMenuInterfaceProps } from "../EditActiveMenuInterface";
import { EditBrowseMenuProps } from "../EditBrowseMenu";
import { NavigateMenuProps } from "../NavigateMenu";
import { WordViewNavBarAssemblyProps } from "../WordViewNavBarAssembly";
import { getAddMenuElements } from "./add-menu-elements";
import { State, WordViewAssemblyAction } from "./types";

export function createEditActiveDispatch(dispatch: React.Dispatch<WordViewAssemblyAction>): EditActiveMenuDispatch {
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

export function createOnModeChange(state: State, dispatch: React.Dispatch<WordViewAssemblyAction>): (newMode: WordViewMode) => void {
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
            const dispatchType: WordViewAssemblyAction["type"] = "edit.active: switch mode";
            throw `Cannot switch to '${newMode}' via '${dispatchType}' action`;
        }
        dispatch({
            type: "switch mode",
            target: newMode
        });
    };
}

export function convertToMenuProps(state: State, dispatch: React.Dispatch<WordViewAssemblyAction>): WordViewNavBarAssemblyProps["props"] {
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
            const output: DeleteMenuProps = {
                onDeleteAll: () => dispatch({ type: "delete: all" })
            };
            return output;
        }
    }
}

export function createOnLabelClick(state: State, dispatch: React.Dispatch<WordViewAssemblyAction>): (id: ElementId) => void {
    switch (state.mode) {
        case "navigate":
            return (id) => dispatch({
                type: "navigate: expanded",
                expanded: id
            });
        case "edit.browse":
            return (id) => dispatch({
                type: "edit.browse: edit.active",
                id: id
            });
        case "edit.active": {
            const { diagram, property } = state;
            if (property === undefined) {
                return () => { return; };
            } else {
                return (id) => {
                    const item = DiagramState.getItem(diagram, id);
                    if (item.ref === state.id) {
                        dispatch({
                            type: "edit.active: remove reference",
                            property: property,
                            id: id
                        });
                    } else {
                        dispatch({
                            type: "edit.active: add reference",
                            property: property,
                            id: id
                        });
                    }
                };
            }
        }
        case "delete":
            return (id) => dispatch({
                type: "delete: element",
                id: id
            });
    }
    return () => { return; };
}