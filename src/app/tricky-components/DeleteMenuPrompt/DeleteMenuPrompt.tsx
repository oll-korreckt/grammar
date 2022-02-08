import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.module.scss";


export const DeleteMenuPrompt = makeRefComponent<HTMLSpanElement>("DeleteMenuPrompt", ({ }, ref) => {
    return (
        <span
            ref={ref}
            className={accessClassName(styles, "deleteMenuPrompt")}
        >
            Select Element(s) to Delete
        </span>
    );
});