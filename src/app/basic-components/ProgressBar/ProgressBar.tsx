import React from "react";
import { makeRefComponent } from "@app/utils/hoc";
import { accessClassName } from "@app/utils";
import styles from "./_styles.scss";

export interface ProgressBarProps {
    percentage: number;
    children: [React.ReactElement, React.ReactElement];
}

export const ProgressBar = makeRefComponent<HTMLDivElement, ProgressBarProps>("ProgressBar", ({ percentage, children }, ref) => {
    if (percentage < 0 || percentage > 100) {
        throw `percentage value of ${percentage} is not between 0 and 100`;
    }
    const gridTemplateColumns = `${percentage}% ${100 - percentage}%`;
    return (
        <div
            className={accessClassName(styles, "progressBar")}
            ref={ref}
            style={{ gridTemplateColumns: gridTemplateColumns }}
        >
            {children}
        </div>
    );
});