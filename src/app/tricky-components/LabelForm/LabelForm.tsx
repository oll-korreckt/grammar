import { accessClassName } from "@app/utils";
import React from "react";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { LabelViewNavBarAssembly } from "../LabelViewNavBarAssembly";
import { convertToMenuProps, createOnLabelClick, createOnModeChange } from "./adapter";
import { useLabelForm } from "./reducer";
import { LabelFormProps } from "./types";
import { LabelSettingsMode, Utils } from "./utils";
import styles from "./_styles.scss";

export const LabelForm: React.VFC<LabelFormProps> = (props) => {
    const [state, dispatch] = useLabelForm(props);
    const onModeChange = createOnModeChange(state, dispatch);
    const menuProps = convertToMenuProps(state, dispatch);
    const lexemes = Utils.getLabelData(state.diagram, state.display);
    const labelSettingsMode: LabelSettingsMode = state.mode === "edit.active"
        ? { type: "edit.active", id: state.id, property: state.property }
        : { type: state.mode };
    const settings = Utils.getLabelSettings(labelSettingsMode, state.diagram, lexemes);
    const onLabelClick = createOnLabelClick(state, dispatch);

    return (
        <div className={accessClassName(styles, "labelForm")}>
            <LabelViewAssembly
                mode={state.mode}
                settings={settings}
                onLabelClick={onLabelClick}
            >
                {lexemes}
            </LabelViewAssembly>
            <LabelViewNavBarAssembly
                mode={state.mode}
                onModeChange={onModeChange}
                props={menuProps}
            />
        </div>
    );
};