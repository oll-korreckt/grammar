import { MessageBoxModal } from "@app/basic-components/MessageBoxModal";
import React, { useEffect, useRef } from "react";
import { EditFormView } from "../EditFormView";
import { InputFormProps } from "../InputForm";
import { LabelFormProps } from "../LabelForm/types";
import { InputKeyContext } from "../context";
import { Action, convertToEditFormState, EditFormState, InputFormInternalState, LabelFormInternalState, useEditForm } from "./reducer";

function convertToInputProps(inputState: InputFormInternalState, dispatch: React.Dispatch<Action>): InputFormProps {
    return {
        initialValue: inputState.initialValue,
        onStateChange: (state) => dispatch({
            type: "input: update state",
            value: state.value,
            errorState: state.errorState
        })
    };
}

function convertToLabelProps(labelState: LabelFormInternalState, dispatch: React.Dispatch<Action>): LabelFormProps {
    return {
        initialDiagram: labelState.currentDiagram,
        onStateChange: ({ diagram, category, expanded }) => {
            dispatch({
                type: "label: update state",
                expanded,
                diagram,
                category
            });
        }
    };
}

export interface EditFormProps {
    initialState?: EditFormState;
    saveState?: (currentState: EditFormState) => void;
}

export const EditForm: React.VFC<EditFormProps> = ({ initialState, saveState }) => {
    const [state, dispatch] = useEditForm(initialState);
    const updateRef = useRef(false);
    const extendedDispatch: typeof dispatch = (action) => {
        if (action.type !== "input: update state") {
            updateRef.current = true;
        }
        dispatch(action);
    };
    const { stage, inputState, labelState } = state;
    const inputProps = convertToInputProps(inputState, extendedDispatch);
    const labelProps = convertToLabelProps(labelState, extendedDispatch);

    useEffect(() => {
        if (updateRef.current && !!saveState) {
            const serializedState = convertToEditFormState(state);
            saveState(serializedState);
        }
        updateRef.current = false;
    }, [state, saveState]);

    const { inputKey, enableLabelSwitch } = inputState;

    return (
        <InputKeyContext.Provider value={{ inputKey }}>
            <EditFormView
                mode={stage}
                onModeClick={(mode) => {
                    if (mode !== state.stage) {
                        extendedDispatch({ type: "stage switch" });
                    }
                }}
                inputFormProps={inputProps}
                labelFormProps={labelProps}
                disableLabelMode={stage === "input" && !enableLabelSwitch}
            />
            {inputState.askReplace &&
                <MessageBoxModal
                    buttons={[
                        { text: "Discard Changes", alignment: "left" },
                        { text: "Yes", alignment: "right" },
                        { text: "No", alignment: "right" }
                    ]}
                    onResponse={(response) => {
                        if (response.type === "off screen click") {
                            extendedDispatch({ type: "input: reject replace" });
                            return;
                        }
                        switch (response.text) {
                            case "Discard Changes":
                                extendedDispatch({ type: "input: discard changes" });
                                break;
                            case "Yes":
                                extendedDispatch({ type: "input: accept replace" });
                                break;
                            case "No":
                                extendedDispatch({ type: "input: reject replace" });
                                break;
                        }
                    }}
                >
                    Proceeding will result in a new model with all labels from the old model being deleted. Proceed?
                </MessageBoxModal>
            }
        </InputKeyContext.Provider>
    );
};