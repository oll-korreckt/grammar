import { MessageBoxModal } from "@app/basic-components/MessageBoxModal";
import React from "react";
import { EditFormView } from "../EditFormView";
import { InputFormProps } from "../InputForm";
import { LabelFormProps } from "../LabelForm/types";
import { Action, EditFormProps, InputStuff, LabelStuff, useEditForm } from "./reducer";

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
                            dispatch({ type: "input: reject replace" });
                            return;
                        }
                        switch (response.text) {
                            case "Yes":
                                dispatch({ type: "input: accept replace" });
                                break;
                            case "No":
                                dispatch({ type: "input: reject replace" });
                                break;
                        }
                    }}
                >
                    Proceeding will result in a new model with all labels from the old model being deleted. Proceed?
                </MessageBoxModal>
            }
        </>
    );
};