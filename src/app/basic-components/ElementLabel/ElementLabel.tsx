import React from "react";
import { Colors, accessClassName, RefComponent, makeRefComponent } from "@app/utils";
import styles from "./_styles.scss";

export interface ElementLabelProps {
    color: Colors;
    children: string;
}

export const ElementLabel: RefComponent<HTMLDivElement, ElementLabelProps> = makeRefComponent("ElementLabel", ({ children, color }, ref) => {
    const className = accessClassName(styles, `${color}ElementLabel`, `${color}VerticalBorders`);
    return <div className={className} ref={ref}>{children}</div>;
});