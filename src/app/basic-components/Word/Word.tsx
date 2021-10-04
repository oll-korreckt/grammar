/* eslint-disable @typescript-eslint/ban-types */
import { accessClassName, Colors } from "@app/utils";
import { makeRefComponent, makeRefHoc, RefComponent } from "@app/utils/hoc";
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
    children: ReactNode;
}

export const HeadLabel = makeRefComponent<HTMLDivElement, HeadLabelProps>("HeadLabel", ({ children }, ref) => (
    <div
        className={accessClassName(styles, "headLabel")}
        ref={ref}
        onMouseDown={cancelHighlightDoubleClick}
        id="headLabel"
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

const colors: Colors[] = [
    "color1",
    "color2",
    "color3",
    "color4",
    "color5",
    "color6",
    "color7",
    "color8",
    "color9",
    "color10",
    "color11",
    "color12"
];

function getColorClass(color: Colors): string {
    return accessClassName(styles, color);
}

function getFadeName(color: Colors): string {
    return `${color}Fade`;
}

export function withDisable<TElement extends HTMLElement, TProps = {}>(Component: RefComponent<TElement, TProps>): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withDisable", (_, element) => {
        element.classList.remove(
            getColorClass("color1"),
            getColorClass("color2"),
            getColorClass("color3"),
            getColorClass("color4"),
            getColorClass("color5"),
            getColorClass("color6"),
            getColorClass("color7"),
            getColorClass("color8"),
            getColorClass("color9"),
            getColorClass("color10"),
            getColorClass("color11"),
            getColorClass("color12")
        );
        const header = element.querySelector("#headLabel");
        if (header !== null) {
            element.children[0].removeChild(header);
        }
    });
}

export function withFade<TElement extends HTMLElement, TProps = {}>(Component: RefComponent<TElement, TProps>): RefComponent<TElement, TProps> {
    const fadeMap: Record<string, string> = {};
    colors.forEach((color) => {
        fadeMap[getColorClass(color)] = getFadeName(color);
    });
    return makeRefHoc(Component, "withFade", (_, element) => {
        for (let index = 0; index < element.classList.length; index++) {
            const className = element.classList[index];
            const newName: string | undefined = fadeMap[className];
            if (newName !== undefined) {
                const newClassName = accessClassName(styles, newName);
                element.classList.replace(className, newClassName);
                break;
            }
        }
    });
}