import { LabelSettings, Lexeme } from "@app/tricky-components/LabelView";
import { DiagramState, DisplayLexeme, ElementDisplayInfo } from "@app/utils";
import { ElementCategory, ElementId } from "@domain/language";
import { HTMLBlockquoteObject } from "@lib/utils";
import React, { useReducer } from "react";
import { ViewAction, MasterState, MasterAction } from "./types";

function resetOpenView(state: MasterState): MasterState {
    if (state.type !== "open") {
        throw `Cannot perform reset in '${state.type}' state`;
    }
    if (state.model === undefined) {
        throw "Cannot reset without model data";
    }
    const { diagram, defaultCategory, defaultElement } = state.model;
    const displayData = getDisplayData(diagram, defaultCategory, defaultElement);
    const output = {
        ...state,
        ...displayData
    };
    delete output.showReset;
    delete output.category;
    delete output.selectedElement;
    if (defaultElement) {
        output.selectedElement = defaultElement;
    }
    if (defaultCategory) {
        output.category = defaultCategory;
    }
    return output;
}

interface DisplayData {
    lexemes: Lexeme[];
    labelSettings: Record<ElementId, LabelSettings>;
}

function getDisplayData(diagram: DiagramState, category?: ElementCategory, selectedElement?: ElementId): DisplayData {
    const lexemes = DisplayLexeme.getDisplayLexemes(diagram, category, selectedElement);
    const labelSettings = getLabelSettings(diagram, lexemes);
    return { lexemes, labelSettings };
}

function getLabelSettings(diagram: DiagramState, lexemes: Lexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    for (let index = 0; index < lexemes.length; index++) {
        const lexeme = lexemes[index];
        if (lexeme.type === "whitespace") {
            continue;
        }
        const { id } = lexeme;
        const { type } = DiagramState.getItem(diagram, id);
        if (type !== "word") {
            const displayInfo = ElementDisplayInfo.getDisplayInfo(type);
            output[id] = {
                color: displayInfo.color,
                header: displayInfo.header
            };
        }
    }
    return output;
}

// function enterOpenState(state: MasterState): MasterState {
//     const output = resetOpenView({
//         ...state,
//         type: "open"
//     });
//     const { model, category, selectedElement } = output;
//     if (model === undefined) {
//         throw "cannot enter open state without a model";
//     }
//     const displaySettings = getDisplayData(model.diagram, category, selectedElement);
//     return {
//         ...output,
//         ...displaySettings
//     };
// }

function initializer(blockquote: HTMLBlockquoteObject): MasterState {
    return {
        type: "closed",
        bqObj: blockquote
    };
}

function reducer(state: MasterState, action: MasterAction | ViewAction): MasterState {
    const errMsg = `Action '${action.type}' is incompatible with State: '${state.type}'`;

    switch (state.type) {
        case "open": {
            const { model } = state;
            if (model === undefined) {
                throw "Cannot enter open state without a model";
            }
            const { diagram } = model;

            switch (action.type) {
                case "open: category select": {
                    const displaySettings = getDisplayData(diagram, action.category);
                    const output: MasterState = {
                        ...state,
                        ...displaySettings,
                        showReset: true,
                        category: action.category
                    };
                    delete output.selectedElement;
                    return output;
                }
                case "open: element select": {
                    const { type } = DiagramState.getItem(diagram, action.id);
                    if (type === "word") {
                        return { ...state };
                    }
                    const { category } = state;
                    const displaySettings = getDisplayData(diagram, category, action.id);
                    return {
                        ...state,
                        ...displaySettings,
                        showReset: true,
                        selectedElement: action.id
                    };
                }
                case "open: up level": {
                    const { category, selectedElement } = state;
                    if (selectedElement === undefined) {
                        throw "Cannot go up a level without a selected element";
                    }
                    const { ref } = DiagramState.getItem(diagram, selectedElement);
                    const displaySettings = getDisplayData(diagram, category, ref);
                    const output: MasterState = {
                        ...state,
                        ...displaySettings,
                        showReset: true,
                        selectedElement: ref
                    };
                    if (output.selectedElement === undefined) {
                        delete output.selectedElement;
                    }
                    return output;
                }
                case "open: close model": {
                    return {
                        ...state,
                        type: "closed"
                    };
                }
                case "open: reset view": {
                    return resetOpenView(state);
                }
            }

            break;
        }

        case "closed": {
            if (action.type === "closed: open model") {
                return state.model === undefined
                    ? { ...state, type: "loading" }
                    : resetOpenView({ ...state, type: "open" });
            }

            break;
        }

        case "error": {
            switch (action.type) {
                case "error: retry":
                    return {
                        ...state,
                        type: "loading"
                    };
                case "error: cancel":
                    return {
                        ...state,
                        type: "closed"
                    };
            }

            break;
        }

        case "loading": {
            switch (action.type) {
                case "loading: data fetched": {
                    return resetOpenView({
                        ...state,
                        type: "open",
                        model: action.data
                    });
                }
                case "loading: fetch error": {
                    return {
                        ...state,
                        type: "error"
                    };
                }
            }

            break;
        }
    }

    throw errMsg;
}

export function useExampleBlockquote(blockquote: HTMLBlockquoteObject): [MasterState, React.Dispatch<MasterAction | ViewAction>] {
    return useReducer(reducer, blockquote, initializer);
}