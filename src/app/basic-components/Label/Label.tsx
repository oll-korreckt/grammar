import { accessClassName, Colors } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.module.scss";

export interface LabelProps {
    children: string | string[];
    color?: Colors;
    fade?: boolean | undefined;
    header?: string;
}

function cancelHighlightDoubleClick(ev: React.MouseEvent): void {
    if (ev.detail > 1) {
        ev.preventDefault();
    }
}

export const Label = makeRefComponent<HTMLSpanElement, LabelProps>("Label", ({ children, color, fade, header }, ref) => {
    const defChildren: string[] = Array.isArray(children) ? children : [children];
    if (defChildren.length === 0) {
        throw "Cannot have empty label";
    }
    const classes = ["label"];
    if (color !== undefined) {
        classes.push(fade ? `${color}Fade` : color);
    }

    return (
        <span
            ref={ref}
            className={accessClassName(styles, ...classes)}
            onMouseDown={cancelHighlightDoubleClick}
        >
            {header &&
                <span className={accessClassName(styles, "header")}>
                    {header}
                </span>
            }
            {defChildren.map((child, index) => {
                return (
                    <span key={index}>
                        {child}
                    </span>
                );
            })}
        </span>
    );
});