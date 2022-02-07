import { accessClassName } from "@app/utils";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.modules.scss";

export interface ButtonBarProps {
    buildFn?: (Component: RefComponent<HTMLDivElement>, item: string) => RefComponent<HTMLDivElement>;
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

export const ButtonBar = makeRefComponent<HTMLDivElement, ButtonBarProps>("ButtonBar", ({ children, buildFn }, ref) => {
    const childArray = initChildren(children);
    return (
        <div className={accessClassName(styles, "buttonBar")} ref={ref}>
            {childArray.map((item) => {
                let Output = createButtonBarItem(item);
                if (buildFn) {
                    Output = buildFn(Output, item);
                }
                return <Output key={item} />;
            })}
        </div>
    );
});

interface ButtonBarItemProps {
    children: string;
}

function createButtonBarItem(item: string): RefComponent<HTMLDivElement> {
    return makeRefComponent<HTMLDivElement>("ButtonBarItem", (_, ref) => (
        <div className={accessClassName(styles, "buttonBarItem")} ref={ref}>
            {item}
        </div>
    ));
}

const ButtonBarItem = makeRefComponent<HTMLDivElement, ButtonBarItemProps>("ButtonBarItem", ({ children }, ref) => (
    <div className={accessClassName(styles, "buttonBarItem")} ref={ref}>
        {children}
    </div>
));