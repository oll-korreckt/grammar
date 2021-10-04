import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import { FaCheck, FaTimes } from "react-icons/fa";
import styles from "./_styles.scss";

export interface EditActiveButtonsProps {
    onDone?: () => void;
    onCancel?: () => void;
    disableDone?: boolean | undefined;
}

export const EditActiveButtons = makeRefComponent<HTMLDivElement, EditActiveButtonsProps>("EditActiveButtons", ({ onDone, onCancel, disableDone }, ref) => {
    const doneClasses = ["button", "done"];
    if (disableDone) {
        doneClasses.push("disableDone");
    }

    return (
        <div className={accessClassName(styles, "container")} ref={ref}>
            <div className={accessClassName(styles, "editActiveButtons")}>
                <div
                    className={accessClassName(styles, ...doneClasses)}
                    onClick={() => onDone && onDone()}
                >
                    <FaCheck/>
                </div>
                <div
                    className={accessClassName(styles, "button", "cancel")}
                    onClick={() => onCancel && onCancel()}
                >
                    <FaTimes/>
                </div>
            </div>
        </div>
    );
});