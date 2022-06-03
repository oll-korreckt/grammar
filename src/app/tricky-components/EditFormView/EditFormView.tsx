import { accessClassName } from "@app/utils";
import React from "react";
import { EditFormNavBar } from "../EditFormNavBar";
import { createEditFormViewSwitch } from "../EditFormViewSwitch";
import { InputForm, InputFormProps } from "../InputForm";
import { LabelForm } from "../LabelForm";
import { LabelFormProps } from "../LabelForm/types";
import styles from "./_styles.module.scss";

export interface EditFormViewProps {
    mode?: EditFormViewMode;
    onModeClick?: (mode: EditFormViewMode) => void;
    disableLabelMode?: boolean | undefined;
    inputFormProps?: InputFormProps;
    labelFormProps?: LabelFormProps;
}

export type EditFormViewMode = "input" | "label";

export const EditFormView: React.VFC<EditFormViewProps> = ({ mode, onModeClick, disableLabelMode, inputFormProps, labelFormProps }) => {
    const defMode: EditFormViewMode = mode !== undefined ? mode : "input";
    const defInputFormProps: InputFormProps = inputFormProps !== undefined
        ? inputFormProps
        : {};
    const defLabelFormProps: LabelFormProps = labelFormProps !== undefined
        ? labelFormProps
        : {};

    return (
        <div className={accessClassName(styles, "editFormView")}>
            <EditFormNavBar
                mode={mode}
                transitionDuration={0.4}
                onModeSwitch={onModeClick}
                disableLabelMode={disableLabelMode}
            />
            <EditFormViewSwitch
                mode={defMode}
                transitionDuration={0.4}
                inputProps={defInputFormProps}
                labelProps={defLabelFormProps}
            />
        </div>
    );
};

const EditFormViewSwitch = createEditFormViewSwitch(InputForm, LabelForm);