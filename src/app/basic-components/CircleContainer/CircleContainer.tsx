import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React, { ReactNode } from "react";
import styles from "./_styles.module.scss";

export interface CircleContainerProps {
    children?: ReactNode;
}

export const CircleContainer = makeRefComponent<HTMLDivElement, CircleContainerProps>("CircleContainer", ({ children }, ref) => (
    <div className={accessClassName(styles, "container")} ref={ref}>
        <div className={accessClassName(styles, "left")}></div>
        <div className={accessClassName(styles, "right")}></div>
        {children}
    </div>
));