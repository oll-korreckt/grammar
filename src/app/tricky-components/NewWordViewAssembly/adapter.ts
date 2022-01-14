import { DerivationTree, DerivationTreeItem, DiagramState, WordViewMode } from "@app/utils";
import { Element, ElementType } from "@domain/language";
import React from "react";
import { AddMenuProps } from "../AddMenu";
import { DeleteMenuProps } from "../DeleteMenu";
import { EditActiveMenuDispatch } from "../EditActiveMenu";
import { EditActiveMenuInterfaceProps } from "../EditActiveMenuInterface";
import { EditBrowseMenuProps } from "../EditBrowseMenu";
import { NavigateMenuProps } from "../NavigateMenu";
import { WordViewNavBarAssemblyProps } from "../WordViewNavBarAssembly";
import { DisplaySettings, State, WordViewAssemblyAction } from "./types";
import { Utils } from "./utils";

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

function extractElementTypes({ primaryType, coordType }: DerivationTreeItem): Exclude<ElementType, "word">[] {
    const output: Exclude<ElementType, "word">[] = [];
    if (primaryType !== undefined) {
        output.push(primaryType.type);
    }
    if (coordType !== undefined) {
        output.push(coordType.type);
    }
    return output;
}

function extractDerivationTreeElements(tree: DerivationTree | undefined): Exclude<ElementType, "word">[] {
    if (tree === undefined) {
        return [];
    }
    const { partOfSpeech, phrase, clause } = tree;
    const output = new Set<Exclude<ElementType, "word">>();
    if (partOfSpeech !== undefined) {
        partOfSpeech.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    if (phrase !== undefined) {
        phrase.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    if (clause !== undefined) {
        clause.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    return Array.from(output);
}

function getAddMenuElements(diagram: DiagramState, display: DisplaySettings): Exclude<ElementType, "word">[] {
    const output = new Set<Exclude<ElementType, "word">>();
    const visibleElementTypes = new Set(Utils.getLabelData(diagram, display).filter(Utils.isElementLabel).map(({ elementType }) => elementType));
    visibleElementTypes.forEach((visibleElementType) => {
        const tree = DerivationTree.getDerivationTree(visibleElementType);
        extractDerivationTreeElements(tree).forEach((element) => output.add(element));
    });
    return Array.from(output);
}

export function convertToMenuProps(state: State, dispatch: React.Dispatch<WordViewAssemblyAction>): WordViewNavBarAssemblyProps["props"] {
    switch (state.mode) {
        case "navigate": {
            const output: NavigateMenuProps = {
                category: state.display.category,
                onCategoryChange: (cat) => dispatch({
                    type: "navigate: category",
                    category: cat
                })
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