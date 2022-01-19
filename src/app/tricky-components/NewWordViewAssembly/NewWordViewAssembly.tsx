import { accessClassName } from "@app/utils";
import React from "react";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { WordViewNavBarAssembly } from "../WordViewNavBarAssembly";
import { convertToMenuProps, createOnLabelClick, createOnModeChange } from "./adapter";
import { useWordViewAssembly } from "./reducer";
import { NewWordViewAssemblyProps } from "./types";
import { LabelSettingsMode, Utils } from "./utils";
import styles from "./_styles.scss";

export const NewWordViewAssembly: React.VFC<NewWordViewAssemblyProps> = (props) => {
    const [state, dispatch] = useWordViewAssembly(props);
    const onModeChange = createOnModeChange(state, dispatch);
    const menuProps = convertToMenuProps(state, dispatch);
    const lexemes = Utils.getLabelData(state.diagram, state.display);
    const labelSettingsMode: LabelSettingsMode = state.mode === "edit.active"
        ? { type: "edit.active", id: state.id, property: state.property }
        : { type: state.mode };
    const settings = Utils.getLabelSettings(labelSettingsMode, state.diagram, lexemes);
    const onLabelClick = createOnLabelClick(state, dispatch);

    return (
        <div className={accessClassName(styles, "wordViewAssembly")}>
            <LabelViewAssembly
                mode={state.mode}
                settings={settings}
                onLabelClick={onLabelClick}
            >
                {lexemes}
            </LabelViewAssembly>
            <WordViewNavBarAssembly
                mode={state.mode}
                onModeChange={onModeChange}
                props={menuProps}
            />
        </div>
    );
};