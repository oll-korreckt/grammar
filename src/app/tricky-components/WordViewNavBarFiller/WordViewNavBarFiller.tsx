import { accessClassName, WordViewMode } from "@app/utils";
import React from "react";
import styles from "./_styles.scss";

export interface WordViewNavBarFillerProps {
    mode?: WordViewMode;
}

const modeMap: Record<WordViewMode, string> = {
    "navigate": "navigate",
    "add": "add",
    "edit.active": "editActive",
    "edit.browse": "editBrowse",
    "delete": "delete"
};

export const WordViewNavBarFiller: React.VFC<WordViewNavBarFillerProps> = ({ mode }) => {
    const definedMode = WordViewMode.getDefault(mode);
    const className = modeMap[definedMode];

    return (
        <>
            <div
                className={accessClassName(styles, className)}
            />
            <div
                className={accessClassName(styles, "offset")}
            />
        </>
    );
};