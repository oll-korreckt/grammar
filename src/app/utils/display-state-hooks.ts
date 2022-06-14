import { LabelSettings, Lexeme } from "@app/tricky-components/LabelView";
import { ElementCategory, ElementType } from "@domain/language";
import React, { createContext, useContext, useEffect, useReducer, useState } from "react";
import { AddMenuState, EditActiveState, InputFrameRenderState, LabelFrameRenderState, NavigateMenuState, PropertyDisplayState } from "./types";

interface UpdateInput {
    type: "input";
    inputText?: string;
    showErrors?: boolean;
    disableLabel?: boolean;
}
interface UpdateLabelsAndLexemes {
    type: "labels + lexemes";
    labelSettings?: Record<string, LabelSettings>;
    lexemes?: Lexeme[];
}
interface UpdateNavigate {
    type: "navigate";
    category?: ElementCategory;
    enableUpLevel?: boolean;
}
interface UpdateAdd {
    type: "add";
    category?: "category" | "phrase" | "clause" | "coordinated" | "sentence";
    elements?: Exclude<ElementType, "word">[];
}

type UpdateEditActive = {
    type: "edit.active";
    editState: "display";
    elementType: ElementType;
    allowSubmit?: boolean;
    assigned: PropertyDisplayState[];
    unassigned: PropertyDisplayState[];
} | {
    type: "edit.active";
    editState: "edit";
    elementType: ElementType;
    allowSubmit?: boolean;
    property: PropertyDisplayState;
}

export type UpdateDisplayStateAction =
    | UpdateInput
    | UpdateLabelsAndLexemes
    | UpdateNavigate
    | UpdateAdd
    | UpdateEditActive

interface State {
    firstRender?: boolean;
    input?: UpdateInput;
    "labels + lexemes"?: UpdateLabelsAndLexemes;
    navigate?: UpdateNavigate;
    add?: UpdateAdd;
    "edit.active"?: UpdateEditActive;
}

export interface DisplayStateContext {
    state: State;
    dispatch: React.Dispatch<UpdateDisplayStateAction>;
}

export const DisplayStateContext = createContext<DisplayStateContext>({
    state: { firstRender: true },
    dispatch: () => { return; }
});

export function useUpdateDisplayState(): (action: UpdateDisplayStateAction) => void {
    const { dispatch } = useContext(DisplayStateContext);
    return dispatch;
}

type CompletedActionsObject =
    | CompletedInputObject
    | CompletedLabelObject;
interface CompletedInputObject {
    type: "input";
    input: UpdateInput;
}
interface CompletedLabelObject extends Omit<State, "input"> {
    type: "label";
    "labels + lexemes": UpdateLabelsAndLexemes;
}

function getOtherState(actions: State): NavigateMenuState | AddMenuState | EditActiveState {
    if (actions.navigate !== undefined) {
        const { category, enableUpLevel } = actions.navigate;
        return {
            mode: "navigate",
            category,
            enableUpLevel
        };
    } else if (actions.add !== undefined) {
        const { category, elements } = actions.add;
        return {
            mode: "add",
            category,
            elements
        };
    } else if (actions["edit.active"] !== undefined) {
        const editActive = actions["edit.active"];
        if (editActive.editState === "display") {
            const { editState, allowSubmit, elementType, assigned, unassigned } = editActive;
            return {
                mode: "edit.active",
                editState,
                elementType,
                allowSubmit,
                assigned,
                unassigned
            };
        } else {
            const { editState, allowSubmit, elementType, property } = editActive;
            return {
                mode: "edit.active",
                editState,
                elementType,
                allowSubmit,
                property
            };
        }
    }
    throw `Invalid action state: ${actions}`;
}

function cleanActionsObject(action: State): CompletedActionsObject {
    const keys = Object.keys(action);
    if (keys.length === 1 && action.input !== undefined) {
        const { input } = action;
        return {
            type: "input",
            input
        };
    } else if (keys.length === 2 && action["labels + lexemes"] !== undefined) {
        const output: CompletedLabelObject = {
            type: "label",
            "labels + lexemes": action["labels + lexemes"]
        };
        if (action.navigate !== undefined) {
            output.navigate = action.navigate;
            return output;
        } else if (action.add !== undefined) {
            output.add = action.add;
            return output;
        } else if (action["edit.active"] !== undefined) {
            output["edit.active"] = action["edit.active"];
            return output;
        }
        // fall through and throw error
    }
    let msg = "Invalid action pattern received\n";
    msg += `input: ${hasKey(action, "input")}\n`;
    msg += `labels + lexemes: ${hasKey(action, "labels + lexemes")}\n`;
    msg += `navigate: ${hasKey(action, "navigate")}\n`;
    msg += `add: ${hasKey(action, "add")}\n`;
    msg += `edit.active: ${hasKey(action, "edit.active")}`;
    throw msg;
}

function hasKey(obj: State, key: keyof State): "yes" | "no" {
    return key in obj ? "yes" : "no";
}

function assembleState(actions: State): InputFrameRenderState | LabelFrameRenderState {
    const cleanedObj = cleanActionsObject(actions);
    if (cleanedObj.type === "input") {
        const { input } = cleanedObj;
        return {
            ...input
        };
    }
    const { labelSettings, lexemes } = cleanedObj["labels + lexemes"];
    const labelStuff: Pick<LabelFrameRenderState, "lexemes" | "labelSettings"> = {
        labelSettings,
        lexemes
    };
    const other = getOtherState(actions);
    return {
        type: "label",
        ...labelStuff,
        ...other
    };
}

interface ExtendedDisplayStateContext extends DisplayStateContext {
    assembledState?: InputFrameRenderState | LabelFrameRenderState;
}

function withoutInput(state: State): State {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { input, ...rest } = state;
    return { ...rest };
}

function reducer(state: State, action: UpdateDisplayStateAction): State {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { firstRender, ...restOfState } = state;
    switch (action.type) {
        case "input":
            return {
                input: action
            };
        case "labels + lexemes":
            return withoutInput({
                ...restOfState,
                "labels + lexemes": action
            });
        case "navigate":
            return withoutInput({
                ...restOfState,
                navigate: action
            });
        case "add":
            return withoutInput({
                ...restOfState,
                add: action
            });
        case "edit.active":
            return withoutInput({
                ...restOfState,
                "edit.active": action
            });
        default:
            throw `Invalid action: '${(action as any).type}'`;
    }
}

export function useDisplayState(): ExtendedDisplayStateContext {
    const [state, dispatch] = useReducer(reducer, { firstRender: true });
    const [assembledState, setAssembledState] = useState<InputFrameRenderState | LabelFrameRenderState>();

    useEffect(() => {
        if (state.firstRender) {
            return;
        }
        const newAssembledState = assembleState(state);
        setAssembledState(newAssembledState);
    }, [state]);
    return { state, dispatch, assembledState };
}