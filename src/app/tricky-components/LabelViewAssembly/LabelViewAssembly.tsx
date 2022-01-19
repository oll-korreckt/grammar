import { accessClassName, WordViewMode } from "@app/utils";
import { makeRefComponent, withClassNameProp } from "@app/utils/hoc";
import React from "react";
import { LabelView, LabelViewProps } from "../LabelView";
import styles from "./_styles.scss";

export interface LabelViewAssemblyProps extends LabelViewProps {
    mode: WordViewMode;
}

function mapToClass(mode: WordViewMode): string {
    switch (mode) {
        case "edit.browse":
            return "editBrowse";
        case "edit.active":
            return "editActive";
        default:
            return mode;
    }
}

export const LabelViewAssembly = makeRefComponent<HTMLDivElement, LabelViewAssemblyProps>("LabelViewAssembly", (props, ref) => {
    const { mode, ...rest } = props;
    return (
        <div
            ref={ref}
            className={accessClassName(styles, "labelViewAssembly")}
        >
            <ExtendedLabelView
                className={accessClassName(styles, "labelView")}
                {...rest}
            />
            <div className={accessClassName(styles, mapToClass(mode))}/>
        </div>
    );
});

const ExtendedLabelView = withClassNameProp(LabelView);