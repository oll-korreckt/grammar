import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.module.scss";

export interface NewTextEditorProps {
    children?: string;
    onInputChange?: (input: string) => void;
    errors?: boolean;
}

export const NewTextEditor: React.VFC<NewTextEditorProps> = ({ onInputChange, errors, children }) => {
    const classes = [
        "textEditor"
    ];
    if (errors) {
        classes.push("textEditorError");
    }
    return (
        <textarea
            className={accessClassName(styles, ...classes)}
            onChange={(e) => onInputChange && onInputChange(e.target.value)}
            value={children}
        />
    );
};