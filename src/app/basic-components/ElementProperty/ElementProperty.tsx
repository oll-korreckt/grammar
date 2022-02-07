import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import { IoPricetag, IoPricetagOutline, IoPricetags, IoPricetagsOutline } from "react-icons/io5";
import styles from "./_styles.modules.scss";

export interface ElementPropertyProps {
    children: string;
    selectionType: "single" | "multi";
    status: "complete" | "incomplete" | "error";
    state: "selected" | "unselected";
}

export const ElementProperty = makeRefComponent<HTMLDivElement, ElementPropertyProps>("ElementProperty", ({ children, selectionType, state, status }, ref) => {
    const classNames = ["elementProperty", state];
    if (status === "error") {
        classNames.push("error");
    }
    return (
        <div
            className={accessClassName(styles, ...classNames)}
            ref={ref}
        >
            {children}
            <span>&nbsp;</span>
            {selectionType === "single"
                ? status === "complete"
                    ? <IoPricetag />
                    : <IoPricetagOutline />
                : status === "complete"
                    ? <IoPricetags />
                    : <IoPricetagsOutline />
            }
        </div>
    );
});