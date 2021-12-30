import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.scss";


export const DeleteMenuPrompt: React.VFC = () => {
    return (
        <span className={accessClassName(styles, "deleteMenuPrompt")}>
            Select Element(s) to Delete
        </span>
    );
};