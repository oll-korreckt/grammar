import { MessageBoxModal } from "@app/basic-components/MessageBoxModal";
import { DiagramState, Stage } from "@app/utils";
import React, { useReducer } from "react";
import { EditFormView } from "../EditFormView";
import { InputFormErrorState, InputFormProps } from "../InputForm";
import { LabelFormProps } from "../LabelForm/types";

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

interface State {
    stage: Stage;
    inputStuff: InputStuff;
    labelStuff: LabelStuff;
}

interface InputStuff {
    initialValue: string;
    currentValue: string;
    errorState: InputFormErrorState;
    askReplace?: boolean;
}

interface LabelStuff {
    initialDiagram: DiagramState | undefined;
    currentDiagram: DiagramState | undefined;
}

type Action = {
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
    type: "label: update diagram";
    diagram: DiagramState;
}

function useEditForm(props: EditFormProps): [State, React.Dispatch<Action>] {
    function initializer({ initialStage, initialValue }: EditFormProps): State {
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
                errorState: "none"
            },
            labelStuff: {
                initialDiagram: diagram,
                currentDiagram: diagram
            }
        };
    }

    function reducer(state: State, action: Action): State {
        switch (action.type) {
            case "stage switch": {
                if (state.stage === "input") {
                    const { inputStuff } = state;
                    if (inputStuff.initialValue !== inputStuff.currentValue) {
                        return {
                            ...state,
                            inputStuff: {
                                ...inputStuff,
                                askReplace: true
                            }
                        };
                    }
                    return {
                        ...state,
                        stage: "label"
                    };
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
                        errorState: action.errorState
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

    return useReducer(reducer, props, initializer);
}

function convertToInputProps(stuff: InputStuff, dispatch: React.Dispatch<Action>): InputFormProps {
    return {
        initialValue: stuff.currentValue,
        onStateChange: (state) => dispatch({
            type: "input: update state",
            value: state.value,
            errorState: state.errorState
        })
    };
}

function convertToLabelProps(stuff: LabelStuff, dispatch: React.Dispatch<Action>): LabelFormProps {
    return {
        initialDiagram: stuff.currentDiagram,
        onDiagramChange: (newDiagram) => dispatch({
            type: "label: update diagram",
            diagram: newDiagram
        })
    };
}

export const EditForm: React.VFC<EditFormProps> = (props) => {
    const [state, dispatch] = useEditForm(props);
    const { stage, inputStuff, labelStuff } = state;
    const inputProps = convertToInputProps(inputStuff, dispatch);
    const labelProps = convertToLabelProps(labelStuff, dispatch);

    return (
        <>
            <EditFormView
                mode={stage}
                onModeClick={(mode) => {
                    if (mode !== state.stage) {
                        dispatch({ type: "stage switch" });
                    }
                }}
                inputFormProps={inputProps}
                labelFormProps={labelProps}
                disableLabelMode={inputStuff.errorState !== "none"}
            />
            {inputStuff.askReplace &&
                <MessageBoxModal
                    type="yes no"
                    onResponse={(response) => {
                        switch (response) {
                            case "yes":
                                dispatch({ type: "input: accept replace" });
                                break;
                            case "no":
                            case "off screen click":
                                dispatch({ type: "input: reject replace" });
                                break;
                        }
                    }}
                >
                    Proceeding will result in the old being deleted. Proceed?
                </MessageBoxModal>
            }
        </>
    );
};