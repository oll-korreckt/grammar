import React from "react";
import { accessClassName, makeRefComponent } from "@app/utils";
import { FaTimesCircle } from "react-icons/fa";
import styles from "./_styles.scss";

export interface SelectedItemDisplayButtonProps {
    children: string;
    showX?: boolean;
}

export const SelectedItemDisplayButton = makeRefComponent<HTMLDivElement, SelectedItemDisplayButtonProps>("SelectedItemDisplayButton", ({ children, showX }, ref) => {
    return(
        <div
            className={accessClassName(styles, "button")}
            ref={ref}
        >
            <div className={accessClassName(styles, "buttonText")}>{children}</div>
            {showX &&
                <div className={accessClassName(styles, "buttonX")}>
                    <FaTimesCircle />
                </div>
            }
        </div>
    );
});