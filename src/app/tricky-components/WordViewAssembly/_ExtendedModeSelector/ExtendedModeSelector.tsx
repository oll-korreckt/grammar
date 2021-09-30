import { ModeSelector, ModeSelectorProps } from "@app/basic-components/ModeSelector";
import { accessClassName, DiagramStateContext } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React, { useContext } from "react";
import styles from "./_styles.scss";

export const ExtendedModeSelector = makeRefComponent<HTMLDivElement, ModeSelectorProps>("ExtendedModeSelector", (props, ref) => {
    const { progress } = useContext(DiagramStateContext);
    const percentage = progress.category.percentage * 0.4 + progress.syntax.percentage * 0.6;
    return (
        <div className={accessClassName(styles, "modeSelector")} ref={ref}>
            <div className={accessClassName(styles, "progress")}>
                <div
                    style={{ width: `${percentage}%` }}
                    className={accessClassName(styles, "percentage")}
                >
                </div>
            </div>
            <ModeSelector {...props}/>
        </div>
    );
});