import { accessClassName, Colors } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React, { ReactNode } from "react";
import styles from "./_styles.scss";

function cancelHighlightDoubleClick(ev: React.MouseEvent): void {
    if (ev.detail > 1) {
        ev.preventDefault();
    }
}

export const Space: React.VFC = () => (
    <span
        className={accessClassName(styles, "word")}
        onMouseDown={cancelHighlightDoubleClick}
    >
        &#32;
    </span>
);

export interface WordProps {
    children: ReactNode;
}

export const Word = makeRefComponent<HTMLSpanElement, WordProps>("Word", ({ children }, ref) => (
    <span
        className={accessClassName(styles, "word")}
        ref={ref}
        onMouseDown={cancelHighlightDoubleClick}
    >
        {children}
    </span>
));

export interface HeadLabelProps {
    children: string;
}

export const HeadLabel = makeRefComponent<HTMLDivElement, HeadLabelProps>("HeadLabel", ({ children }, ref) => (
    <div
        className={accessClassName(styles, "headLabel")}
        ref={ref}
        onMouseDown={cancelHighlightDoubleClick}
    >
        {children}
    </div>
));

export interface WordLabelProps {
    children: ReactNode;
    color: Colors;
}

export const WordLabel = makeRefComponent<HTMLSpanElement, WordLabelProps>("WordLabel", ({ color, children }, ref) => (
    <span
        className={accessClassName(styles, "wordLabel", color)}
        ref={ref}
        onMouseDown={cancelHighlightDoubleClick}
    >
        {children}
    </span>
));

export function withSpace(Component: typeof Word): typeof Word {
    return makeRefComponent("withSpace", (props, ref) => (
        <>
            <Component {...props} ref={ref}/>
            <Space/>
        </>
    ));
}