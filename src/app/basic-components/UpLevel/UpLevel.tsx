import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./_styles.scss";

export interface UpLevelProps {
    children: string;
    onUpFolder?: () => void;
}

export const UpLevel = makeRefComponent<HTMLDivElement, UpLevelProps>("UpFolder", ({ children, onUpFolder }, ref) => (
    <div className={accessClassName(styles, "upLevel")} ref={ref}>
        <FaArrowLeft
            onClick={() => onUpFolder && onUpFolder()}
            className={accessClassName(styles, "arrow")}
        />
        <div className={accessClassName(styles, "text")}>
            {children}
        </div>
    </div>
));