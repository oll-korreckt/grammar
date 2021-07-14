import { accessClassName, makeRefComponent, RefComponent } from "@app/utils";
import React from "react";
import styles from "./_styles.scss";

export interface ButtonBarItemProps {
    onClick?: () => void;
    children: string;
}

export const ButtonBarItem: React.FC<ButtonBarItemProps> = (props) => {
    const className = accessClassName(styles, "buttonBarItem");
    return (
        <div className={className}>
            <div
                onClick={() => props.onClick && props.onClick()}
                className={accessClassName(styles, "interior")}
            >
                {props.children}
            </div>
        </div>
    );
};

export interface ButtonBarProps {
    children: React.ReactElement<ButtonBarItemProps> | [React.ReactElement<ButtonBarItemProps>, React.ReactElement<ButtonBarItemProps>];
}

function initChildren(children: ButtonBarProps["children"]): [React.ReactElement, React.ReactElement] {
    if (Array.isArray(children)) {
        return children;
    } else {
        return [<div className={accessClassName(styles, "empty")} key={0}></div>, children];
    }
}

export const ButtonBar: RefComponent<HTMLDivElement, ButtonBarProps> = makeRefComponent("ButtonBar", ({ children }, ref) => {
    const [left, right] = initChildren(children);
    return (
        <div className={accessClassName(styles, "buttonBar")} ref={ref}>
            {left}
            {right}
        </div>
    );
});