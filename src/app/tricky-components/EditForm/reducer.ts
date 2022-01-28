import { InputFormErrorState } from "@app/tricky-components/InputForm";
import { DiagramState, Stage } from "@app/utils";
import { useReducer } from "react";

export interface EditFormProps {
    initialValue?: string | DiagramState;
    initialStage?: Stage;
}

function getText(initialValue: string | DiagramState | undefined): string {
    if (initialValue === undefined) {
        return "";
    }
    return typeof initialValue === "string"
        ? initialValue
        : DiagramState.getText(initialValue);
}

function getDiagram(initialValue: string | DiagramState | undefined): DiagramState | undefined {
    if (initialValue === undefined) {
        return DiagramState.initEmpty();
    } else if (typeof initialValue === "object") {
        return initialValue;
    }
    try {
        return DiagramState.fromText(initialValue);
    } finally {
        return undefined;
    }
}

export interface State {
    stage: Stage;
    inputStuff: InputStuff;
    labelStuff: LabelStuff;
}

export interface InputStuff {
    initialValue: string;
    currentValue: string;
    enableLabelSwitch?: boolean;
    askReplace?: boolean;
}

export interface LabelStuff {
    initialDiagram?: DiagramState;
    currentDiagram?: DiagramState;
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
    type: "label: update diagram";
    diagram: DiagramState;
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

export function initializer({ initialStage, initialValue }: EditFormProps): State {
    const defInitialStage: Stage = initialStage !== undefined
        ? initialStage
        : "input";
    const text = getText(initialValue);
    const diagram = getDiagram(initialValue);
    return {
        stage: defInitialStage,
        inputStuff: {
            initialValue: text,
            currentValue: text,
            enableLabelSwitch: allowLabelSwitch(text, "none")
        },
        labelStuff: {
            initialDiagram: diagram,
            currentDiagram: diagram
        }
    };
}

export function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "stage switch": {
            if (state.stage === "input") {
                const { inputStuff } = state;
                const proceed = allowProceed(inputStuff.initialValue, inputStuff.currentValue);
                switch (proceed) {
                    case "ask to update": {
                        return {
                            ...state,
                            inputStuff: {
                                ...inputStuff,
                                askReplace: true
                            }
                        };
                    }
                    case "go w/ update": {
                        const newDiagram = DiagramState.fromText(inputStuff.currentValue);
                        return {
                            ...state,
                            stage: "label",
                            inputStuff: {
                                ...inputStuff,
                                initialValue: inputStuff.currentValue
                            },
                            labelStuff: {
                                initialDiagram: newDiagram,
                                currentDiagram: newDiagram
                            }
                        };
                    }
                    case "go w/o update": {
                        return {
                            ...state,
                            stage: "label",
                            inputStuff: {
                                ...inputStuff,
                                initialValue: inputStuff.currentValue
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
            const { inputStuff } = state;
            return {
                ...state,
                inputStuff: {
                    ...inputStuff,
                    currentValue: action.value,
                    enableLabelSwitch: allowLabelSwitch(
                        action.value,
                        action.errorState
                    )
                }
            };
        }
        case "input: enter ask replace": {
            const { inputStuff } = state;
            return {
                ...state,
                inputStuff: {
                    ...inputStuff,
                    askReplace: true
                }
            };
        }
        case "input: accept replace": {
            const { inputStuff } = state;
            const newDiagram = DiagramState.fromText(inputStuff.currentValue);
            return {
                ...state,
                stage: "label",
                labelStuff: {
                    initialDiagram: newDiagram,
                    currentDiagram: newDiagram
                },
                inputStuff: {
                    ...inputStuff,
                    initialValue: inputStuff.currentValue,
                    askReplace: false
                }
            };
        }
        case "input: reject replace": {
            const { inputStuff } = state;
            return {
                ...state,
                inputStuff: {
                    ...inputStuff,
                    askReplace: false
                }
            };
        }
        case "input: discard changes": {
            const { inputStuff } = state;
            return {
                ...state,
                inputStuff: {
                    ...inputStuff,
                    currentValue: inputStuff.initialValue,
                    askReplace: false
                }
            };
        }
        case "label: update diagram": {
            const { labelStuff } = state;
            return {
                ...state,
                labelStuff: {
                    ...labelStuff,
                    currentDiagram: action.diagram
                }
            };
        }
    }
}

export function useEditForm(props: EditFormProps): [State, React.Dispatch<Action>] {
    return useReducer(reducer, props, initializer);
}