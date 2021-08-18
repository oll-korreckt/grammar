import { accessClassName, Colors } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React, { ReactNode } from "react";
import styles from "./_styles.scss";

export const Space: React.VFC = () => {
    return <span className={accessClassName(styles, "word")}>&#32;</span>;
};

export interface WordProps {
    children: ReactNode;
}

export const Word = makeRefComponent<HTMLSpanElement, WordProps>("Word", ({ children }, ref) => {
    return <span className={accessClassName(styles, "word")} ref={ref}>{children}</span>;
});

export interface HeadLabelProps {
    children: string;
}

export const HeadLabel = makeRefComponent<HTMLDivElement, HeadLabelProps>("HeadLabel", ({ children }, ref) => {
    return <div className={accessClassName(styles, "headLabel")} ref={ref}>{children}</div>;
});

export interface WordLabelProps {
    children: ReactNode;
    color: Colors;
}

export const WordLabel = makeRefComponent<HTMLSpanElement, WordLabelProps>("WordLabel", ({ color, children }, ref) => {
    return <span className={accessClassName(styles, "wordLabel", color)} ref={ref}>{children}</span>;
});

export function withSpace(Component: typeof Word): typeof Word {
    return makeRefComponent("withSpace", (props, ref) => (
        <>
            <Component {...props} ref={ref}/>
            <Space/>
        </>
    ));
}