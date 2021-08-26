import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";

export interface ButtonBarProps {
    itemSelect?: (item: string) => void;
    children: string | [string, string];
}

function initChildren(children: ButtonBarProps["children"]): string[] {
    if (Array.isArray(children)) {
        const [left, right] = children;
        if (left === right) {
            throw "Items must be unique";
        }
        return children;
    } else {
        return [children];
    }
}

export const ButtonBar = makeRefComponent<HTMLDivElement, ButtonBarProps>("ButtonBar", ({ children, itemSelect }, ref) => {
    const childArray = initChildren(children);
    return (
        <div className={accessClassName(styles, "buttonBar")} ref={ref}>
            {childArray.map((item) => (
                <div
                    className={accessClassName(styles, "buttonBarItem")}
                    key={item}
                    onClick={() => itemSelect && itemSelect(item)}
                >
                    {item}
                </div>
            ))}
        </div>
    );
});