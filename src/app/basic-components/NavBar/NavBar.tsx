import { accessClassName, Stage } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";

export interface NavBarProps {
    stage: Stage;
    onStageChange?: (stage: Stage) => void;
}

interface Item {
    label: string;
    stage: Stage;
}

export const NavBar = makeRefComponent<HTMLDivElement, NavBarProps>("NavBar", ({ stage, onStageChange }, ref) => {
    const items: Item[] = [
        { label: "Input", stage: "input" },
        { label: "Label", stage: "label" }
    ];

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "container")}
        >
            {items.map((item) => {
                return (
                    <div
                        key={item.stage}
                        className={accessClassName(
                            styles,
                            "item",
                            item.stage === stage ? "selected" : "unselected"
                        )}
                        onClick={() => onStageChange && onStageChange(item.stage)}
                    >
                        {item.label}
                    </div>
                );
            })}
        </div>
    );
});