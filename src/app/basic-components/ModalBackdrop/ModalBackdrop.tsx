import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";

export interface ModalBackdropProps {
    onClick?: () => void;
    children?: React.ReactNode;
}

export const ModalBackdrop = makeRefComponent<HTMLDivElement, ModalBackdropProps>("ModalBackdrop", ({ onClick, children }, ref) => {
    return (
        <div
            ref={ref}
            className={accessClassName(styles, "modalBackdrop")}
            onClick={() => onClick && onClick()}
        >
            {children}
        </div>
    );
});