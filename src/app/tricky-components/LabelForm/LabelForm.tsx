import { useUpdateDisplayState } from "@app/utils";
import React, { useEffect, useRef } from "react";
import { LabelFormView } from "../LabelFormView";
import { ElementLexeme } from "../LabelView";
import { convertToMenuProps, createOnLabelClick, createOnModeChange } from "./adapter";
import { useLabelForm } from "./reducer";
import { LabelFormAction, LabelFormProps, LabelFormState } from "./types";
import { LabelSettingsMode, Utils } from "./utils";
import hash from "object-hash";

export const LabelForm: React.VFC<LabelFormProps> = (props) => {
    const [state, dispatch] = useLabelForm(props);
    const updateDisplay = useUpdateDisplayState();
    const diagramChange = useRef(false);
    const extendedDispatch: React.Dispatch<LabelFormAction> = (action) => {
        switch (action.type) {
            case "edit.active: submit":
            case "navigate: category":
            case "navigate: expanded":
            case "navigate: up":
            case "delete: element":
            case "delete: delete all yes":
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

    useEffect(() => {
        updateDisplay({
            type: "labels + lexemes",
            labelSettings: settings,
            lexemes
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hash(lexemes), hash(settings)]);

    const { onStateChange } = props;
    useEffect(() => {
        if (diagramChange.current) {
            diagramChange.current = false;
            if (onStateChange) {
                const arg: LabelFormState = {
                    diagram: state.diagram
                };
                const { display } = state;
                if (display.category) {
                    arg.category = display.category;
                }
                if (display.expanded) {
                    arg.expanded = display.expanded;
                }
                onStateChange(arg);
            }
        }
    }, [state, onStateChange]);

    return (
        <LabelFormView
            mode={state.mode}
            labelSettings={settings}
            onLabelClick={onLabelClick}
            onModeChange={onModeChange}
            navBarProps={menuProps}
        >
            {lexemes}
        </LabelFormView>
    );
};