import { accessClassName, LabelFormMode } from "@app/utils";
import { ElementId } from "@domain/language";
import React from "react";
import { LabelSettings, Lexeme } from "../LabelView";
import { LabelViewAssembly } from "../LabelViewAssembly";
import { LabelViewNavBarAssembly, LabelViewNavBarAssemblyProps } from "../LabelViewNavBarAssembly";
import styles from "./_styles.module.scss";

export interface LabelFormViewProps {
    mode: LabelFormMode;
    labelSettings?: Record<string, LabelSettings>;
    children: Lexeme[];
    onLabelClick?: (id: ElementId) => void;
    onModeChange?: (newMode: LabelFormMode) => void;
    navBarProps: LabelViewNavBarAssemblyProps["props"];
}

export const LabelFormView: React.FC<LabelFormViewProps> = ({ mode, labelSettings, onLabelClick, children, onModeChange, navBarProps }) => {
    return (
        <div className={accessClassName(styles, "labelForm")}>
            <LabelViewAssembly
                mode={mode}
                settings={labelSettings}
                onLabelClick={onLabelClick}
            >
                {children}
            </LabelViewAssembly>
            <LabelViewNavBarAssembly
                mode={mode}
                onModeChange={onModeChange}
                props={navBarProps}
            />
        </div>
    );
};