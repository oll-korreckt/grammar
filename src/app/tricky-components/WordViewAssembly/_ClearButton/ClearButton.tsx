import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import { FaBomb } from "react-icons/fa";
import styles from "./_styles.scss";

export const ClearButton = makeRefComponent<HTMLDivElement>("ClearButton", (_, ref) => {
    return (
        <div className={accessClassName(styles, "clearButton")} ref={ref}>
            <div>
                <FaBomb className={accessClassName(styles, "icon")}/>
                <div className={accessClassName(styles, "label")}>
                    Clear
                </div>
            </div>
        </div>
    );
});