import { InputFormErrorState } from "@app/tricky-components/InputForm";
import { DiagramState, Stage } from "@app/utils";
import { ElementCategory, ElementId } from "@domain/language";
import { useReducer } from "react";

export interface EditFormState {
    stage?: Stage;
    inputText?: string;
    diagram?: DiagramState;
    category?: ElementCategory;
    selected?: ElementId;
}

export interface EditFormInternalState {
    stage: Stage;
    inputState: InputFormInternalState;
    labelState: LabelFormInternalState;
}

export interface InputFormInternalState {
    inputKey?: "0" | "1";
    initialValue: string;
    currentValue: string;
    enableLabelSwitch?: boolean;
    askReplace?: boolean;
}

export interface LabelFormInternalState {
    initialDiagram?: DiagramState;
    currentDiagram?: DiagramState;
    category?: ElementCategory;
    selected?: ElementId;
}

export function convertToEditFormState({ stage, inputState, labelState }: EditFormInternalState): EditFormState {
    const output: EditFormState = { stage, inputText: inputState.currentValue };
    output.diagram = labelState.currentDiagram;
    if (labelState.category) {
        output.category = labelState.category;
    }
    if (labelState.selected) {
        output.selected = labelState.selected;
    }
    return output;
}

export type Action = {
    type: "stage switch";
} | {
    type: "input: update state";
    value: string;
    errorState: InputFormErrorState;
} | {
    type: "input: enter ask replace";
} | {
    type: "input: accept replace";
} | {
    type: "input: reject replace";
} | {
    type: "input: discard changes";
} | {
    type: "label: update state";
    diagram: DiagramState;
    category?: ElementCategory;
    expanded?: ElementId;
}

export function allowLabelSwitch(currentValue: string, errorState: InputFormErrorState): boolean {
    if (errorState !== "none") {
        return false;
    }
    if (currentValue === "") {
        return false;
    }
    return true;
}

export type ProceedResult = "go w/o update" | "go w/ update" | "ask to update";

export function allowProceed(initialValue: string, currentValue: string): ProceedResult {
    if (initialValue === "") {
        return "go w/ update";
    } else if (initialValue === currentValue) {
        return "go w/o update";
    } else {
        return "ask to update";
    }
}

const KEY_STATE_0 = "0";
const KEY_STATE_1 = "1";

function getDefaultState(): EditFormInternalState {
    const emptyDiagram = DiagramState.initEmpty();

    return {
        stage: "input",
        inputState: {
            inputKey: KEY_STATE_0,
            initialValue: "",
            currentValue: "",
            enableLabelSwitch: allowLabelSwitch("", "none")
        },
        labelState: {
            initialDiagram: emptyDiagram,
            currentDiagram: emptyDiagram
        }
    };
}

function getText(inputText: string | undefined, diagram: DiagramState | undefined): string {
    const hasInputText = 1 << 0;
    const hasDiagram = 1 << 1;
    let state = 0;
    if (inputText !== undefined) {
        state |= hasInputText;
    }
    if (diagram !== undefined) {
        state |= hasDiagram;
    }

    switch (state) {
        case 0: {
            return "";
        }
        case hasInputText: {
            return inputText as string;
        }
        case hasDiagram: {
            return DiagramState.getText(diagram as DiagramState);
        }
        case hasInputText | hasDiagram: {
            const defInputText = inputText as string;
            const diagramText = DiagramState.getText(diagram as DiagramState);
            if (defInputText !== diagramText) {
                throw `Discrepancy between text defined in inputText and diagram.\ninputText: ${inputText}\ndiagram: ${diagramText}`;
            }
            return defInputText;
        }
        default:
            throw `invalid state '${state}'`;
    }
}

export function initializer(state: EditFormState | undefined): EditFormInternalState {
    if (state === undefined) {
        return getDefaultState();
    }

    const { stage, inputText, diagram, category, selected } = state;

    const defStage: Stage = stage !== undefined ? stage : "input";
    const text = getText(inputText, diagram);
    const defDiagram: DiagramState = diagram !== undefined
        ? diagram : DiagramState.initEmpty();

    const inputState: InputFormInternalState = {
        inputKey: KEY_STATE_0,
        initialValue: text,
        currentValue: text,
        enableLabelSwitch: allowLabelSwitch(text, "none"),
        askReplace: false
    };

    const labelState: LabelFormInternalState = {
        initialDiagram: defDiagram,
        currentDiagram: defDiagram
    };
    if (category) {
        labelState.category = category;
    }
    if (selected) {
        labelState.selected = selected;
    }

    return {
        stage: defStage,
        inputState,
        labelState
    };
}

export function reducer(state: EditFormInternalState, action: Action): EditFormInternalState {
    switch (action.type) {
        case "stage switch": {
            if (state.stage === "input") {
                const { inputState } = state;
                const proceed = allowProceed(inputState.initialValue, inputState.currentValue);
                switch (proceed) {
                    case "ask to update": {
                        return {
                            ...state,
                            inputState: {
                                ...inputState,
                                askReplace: true
                            }
                        };
                    }
                    case "go w/ update": {
                        const newDiagram = DiagramState.fromText(inputState.currentValue);
                        return {
                            ...state,
                            stage: "label",
                            inputState: {
                                ...inputState,
                                initialValue: inputState.currentValue
                            },
                            labelState: {
                                initialDiagram: newDiagram,
                                currentDiagram: newDiagram
                            }
                        };
                    }
                    case "go w/o update": {
                        return {
                            ...state,
                            stage: "label",
                            inputState: {
                                ...inputState,
                                initialValue: inputState.currentValue
                            }
                        };
                    }
                }
            }
            return {
                ...state,
                stage: "input"
            };
        }
        case "input: update state": {
            const { inputState } = state;
            return {
                ...state,
                inputState: {
                    ...inputState,
                    currentValue: action.value,
                    enableLabelSwitch: allowLabelSwitch(
                        action.value,
                        action.errorState
                    )
                }
            };
        }
        case "input: enter ask replace": {
            const { inputState: inputStuff } = state;
            return {
                ...state,
                inputState: {
                    ...inputStuff,
                    askReplace: true
                }
            };
        }
        case "input: accept replace": {
            const { inputState } = state;
            const newDiagram = DiagramState.fromText(inputState.currentValue);
            return {
                ...state,
                stage: "label",
                labelState: {
                    initialDiagram: newDiagram,
                    currentDiagram: newDiagram
                },
                inputState: {
                    ...inputState,
                    initialValue: inputState.currentValue,
                    askReplace: false
                }
            };
        }
        case "input: reject replace": {
            const { inputState: inputStuff } = state;
            return {
                ...state,
                inputState: {
                    ...inputStuff,
                    askReplace: false
                }
            };
        }
        case "input: discard changes": {
            const { inputState } = state;
            return {
                ...state,
                inputState: {
                    ...inputState,
                    currentValue: inputState.initialValue,
                    askReplace: false,
                    inputKey: flipKey(inputState.inputKey)
                }
            };
        }
        case "label: update state": {
            const { labelState } = state;
            const output: EditFormInternalState = {
                ...state,
                labelState: {
                    ...labelState,
                    currentDiagram: action.diagram
                }
            };
            if (action.category) {
                output.labelState.category = action.category;
            }
            if (action.expanded) {
                output.labelState.selected = action.expanded;
            }
            return output;
        }
    }
}

function flipKey(key: string | undefined): typeof KEY_STATE_0 | typeof KEY_STATE_1 {
    return (key === undefined || key === KEY_STATE_1)
        ? KEY_STATE_0 : KEY_STATE_1;
}

export function useEditForm(input: EditFormState | undefined): [EditFormInternalState, React.Dispatch<Action>] {
    return useReducer(reducer, input, initializer);
}