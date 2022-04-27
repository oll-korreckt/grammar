import { accessClassName } from "@app/utils";
import React, { useEffect, useRef } from "react";
import { ElementLexeme } from "../LabelView";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { LabelViewNavBarAssembly } from "../LabelViewNavBarAssembly";
import { convertToMenuProps, createOnLabelClick, createOnModeChange } from "./adapter";
import { useLabelForm } from "./reducer";
import { LabelFormAction, LabelFormProps } from "./types";
import { LabelSettingsMode, Utils } from "./utils";
import styles from "./_styles.module.scss";

export const LabelForm: React.VFC<LabelFormProps> = (props) => {
    const [state, dispatch] = useLabelForm(props);
    const diagramChange = useRef(false);
    const extendedDispatch: React.Dispatch<LabelFormAction> = (action) => {
        switch (action.type) {
            case "edit.active: submit":
            case "delete: element":
            case "delete: all":
                diagramChange.current = true;
                break;
        }
        dispatch(action);
    };
    const onModeChange = createOnModeChange(state, extendedDispatch);
    const menuProps = convertToMenuProps(state, extendedDispatch);
    const lexemes = Utils.getLabelData(state.diagram, state.display);
    const labelSettingsMode: LabelSettingsMode = state.mode === "edit.active"
        ? { type: "edit.active", id: state.id, property: state.property }
        : { type: state.mode };
    const elementLexemes = lexemes.filter(({ type }) => type === "element") as ElementLexeme[];
    const settings = Utils.getLabelSettings(labelSettingsMode, state.diagram, elementLexemes);
    const onLabelClick = createOnLabelClick(state, extendedDispatch);

    const { onDiagramChange } = props;
    useEffect(() => {
        if (diagramChange.current) {
            diagramChange.current = false;
            if (onDiagramChange) {
                onDiagramChange(state.diagram);
            }
        }
    }, [state.diagram, onDiagramChange]);

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