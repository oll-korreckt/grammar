import { accessClassName } from "@app/utils";
import React, { useRef } from "react";
import { InputFrameRender, InputFrameRenderProps } from "../InputFrameRender";
import { LabelFrameRender, LabelFrameRenderProps } from "../LabelFrameRender";
import EditFormViewStyles from "../EditFormView/_styles.module.scss";
import { EditFormNavBar } from "../EditFormNavBar";
import { createEditFormViewSwitch } from "../EditFormViewSwitch";

export interface ExtendedInputFrameRenderProps extends InputFrameRenderProps {
    editMode: "input";
    disableLabelMode?: boolean;
}

export type ExtendedLabelFrameRenderProps = LabelFrameRenderProps & {
    editMode: "label";
}

export type EditFormFrameRenderProps =
    | ExtendedInputFrameRenderProps
    | ExtendedLabelFrameRenderProps;

export const EditFormFrameRender: React.VFC<EditFormFrameRenderProps> = (props) => {
    const lastInputProps = useRef<ExtendedInputFrameRenderProps | {}>({});
    const lastLabelProps = useRef<ExtendedLabelFrameRenderProps | {}>({});
    let disableLabelMode: boolean | undefined = false;
    if (props.editMode === "input") {
        lastInputProps.current = props;
        disableLabelMode = props.disableLabelMode;
    } else {
        lastLabelProps.current = props;
    }

    return (
        <div className={accessClassName(EditFormViewStyles, "editFormView")}>
            <EditFormNavBar
                mode={props.editMode}
                transitionDuration={0.4}
                disableLabelMode={disableLabelMode}
            />
            <Switcher
                mode={props.editMode}
                transitionDuration={0.4}
                inputProps={lastInputProps.current}
                labelProps={lastLabelProps.current as any}
            />
        </div>
    );
};

const Switcher = createEditFormViewSwitch(InputFrameRender, LabelFrameRender);