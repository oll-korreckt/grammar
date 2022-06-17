import { accessClassName, Colors, ControlAnimationContext, ControlAnimationUtils } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React, { useContext } from "react";
import styles from "./_styles.module.scss";

export interface LabelProps {
    children: string | string[];
    color?: Colors;
    fade?: boolean | undefined;
    animateId?: string;
    header?: string;
}

function cancelHighlightDoubleClick(ev: React.MouseEvent): void {
    if (ev.detail > 1) {
        ev.preventDefault();
    }
}

export const Label = makeRefComponent<HTMLSpanElement, LabelProps>("Label", ({ children, color, fade, header, animateId }, ref) => {
    const { activeElement } = useContext(ControlAnimationContext);
    const defChildren: string[] = Array.isArray(children) ? children : [children];
    if (defChildren.length === 0) {
        throw "Cannot have empty label";
    }

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);

    const classes = ["label"];
    if (color !== undefined) {
        classes.push(fade ? `${color}Fade` : color);
    }
    if (isAnimating) {
        classes.push("animation");
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