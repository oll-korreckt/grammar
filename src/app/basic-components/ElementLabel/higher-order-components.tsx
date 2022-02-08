import React from "react";
import { ElementLabel, ElementLabelProps } from "./ElementLabel";
import { accessClassName, Colors } from "@app/utils";
import { makeRefComponent, RefComponent, withClassName } from "@app/utils/hoc";
import styles from "./_styles.module.scss";

type ElementLabelType = typeof ElementLabel;
export type SideBorderType = "left" | "right";

export function withHeadLabel(Component: ElementLabelType, headLabel: string): ElementLabelType {
    return makeRefComponent<HTMLDivElement, ElementLabelProps>("withHeadLabel", (props, ref) => {
        const headClass = accessClassName(styles, `${props.color}HeadElementLabel`);
        const textClass = accessClassName(
            styles,
            `${props.color}HeadElementLabelText`,
            `${props.color}VerticalBorders`,
            `${props.color}LeftBorder`
        );
        return (
            <div className={headClass} ref={ref}>
                <div className={textClass}>{headLabel}</div>
                <Component {...props} />
            </div>
        );
    });
}

export function withSideBorder(Component: ElementLabelType, type: SideBorderType): ElementLabelType {
    return withClassName(Component, ({ color }) => [accessClassName(styles, `${color}${type.charAt(0).toUpperCase()}${type.slice(1)}Border`)]);
}

export function withColor(Component: ElementLabelType, color: Colors): RefComponent<HTMLDivElement, Omit<ElementLabelProps, "color">> {
    return makeRefComponent<HTMLDivElement, Omit<ElementLabelProps, "color">>(
        "withColor",
        (props, ref) => {
            const newProps: ElementLabelProps = { ...props, color: color };
            return <Component {...newProps} ref={ref} />;
        }
    );
}