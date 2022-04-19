import { MessageBoxModal } from "@app/basic-components/MessageBoxModal";
import React, { useEffect, useRef } from "react";
import { EditFormView } from "../EditFormView";
import { InputFormProps } from "../InputForm";
import { LabelFormProps } from "../LabelForm/types";
import { InputKeyContext } from "./context";
import { Action, InputStuff, LabelStuff, useEditForm, useLocalStorage } from "./reducer";

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
        onDiagramChange: (newDiagram) => {
            dispatch({
                type: "label: update diagram",
                diagram: newDiagram
            });
        }
    };
}

export const EditForm: React.VFC = () => {
    const storage = useLocalStorage();
    const [state, dispatch] = useEditForm(storage.value);
    const updateRef = useRef(false);
    const extendedDispatch: typeof dispatch = (action) => {
        updateRef.current = true;
        dispatch(action);
    };
    const { stage, inputStuff, labelStuff } = state;
    const inputProps = convertToInputProps(inputStuff, extendedDispatch);
    const labelProps = convertToLabelProps(labelStuff, extendedDispatch);

    useEffect(() => {
        if (updateRef.current) {
            storage.update(state);
        }
        updateRef.current = false;
    }, [state, storage]);

    const { inputKey } = inputStuff;

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
                disableLabelMode={!inputStuff.enableLabelSwitch}
            />
            {inputStuff.askReplace &&
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