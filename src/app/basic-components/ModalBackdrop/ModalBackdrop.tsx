import { accessClassName } from "@app/utils";
import { makeRefComponent, mergeRefs } from "@app/utils/hoc";
import React, { useRef } from "react";
import styles from "./_styles.module.scss";

export interface ModalBackdropProps {
    onClick?: () => void;
    children?: React.ReactNode;
}

export const ModalBackdrop = makeRefComponent<HTMLDivElement, ModalBackdropProps>("ModalBackdrop", ({ onClick, children }, ref) => {
    const refObj = useRef<HTMLDivElement>(null);
    const mergeRef = mergeRefs(ref, refObj);

    return (
        <div
            ref={mergeRef}
            className={accessClassName(styles, "modalBackdrop")}
            onClick={(e) => {
                if (onClick !== undefined
                    && e.target === refObj.current) {
                    onClick();
                }
            }}
        >
            {children}
        </div>
    );
});