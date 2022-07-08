import { accessClassName } from "@app/utils";
import React from "react";
import { useCallback } from "react";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface ElementPropertySelectorProps {
    children: JSX.Element | JSX.Element[];
}

type ArrowState = "left" | "right" | "both" | "none";
type SetArrowState = (newState: ArrowState) => void;
interface Controls {
    leftArrow: HTMLDivElement;
    container: HTMLDivElement;
    rightArrow: HTMLDivElement;
}

function getControls(element: HTMLElement): Controls {
    const leftArrow = element.children[0] as HTMLDivElement;
    const container = element.children[1] as HTMLDivElement;
    const rightArrow = element.children[2] as HTMLDivElement;
    return {
        leftArrow: leftArrow,
        container: container,
        rightArrow: rightArrow
    };
}

function getNewArrowState(container: HTMLElement, newScroll: number): ArrowState {
    let state = 0;
    const atStart = 1 << 0;
    const atEnd = 1 << 1;
    if (newScroll <= 0) {
        state |= atStart;
    }
    const rightScroll = container.scrollWidth - newScroll - container.clientWidth;
    if (rightScroll <= 0) {
        state |= atEnd;
    }

    switch (state) {
        case 0:
            return "both";
        case atStart:
            return "right";
        case atEnd:
            return "left";
        case atStart | atEnd:
            return "none";
        default:
            throw `unhandled state: ${state}`;
    }
}

function isDisplayed(element: HTMLElement): boolean {
    return window.getComputedStyle(element).display !== "none";
}

function isClipped({ left, right }: DOMRect, edge: number): boolean {
    return left < edge && right > edge;
}

function callScroll(container: HTMLElement, setArrowState: SetArrowState, scroll: number): void {
    const newScroll = scroll < 0 ? 0 : scroll;
    container.scrollTo({
        behavior: "smooth",
        left: newScroll
    });
    const newState = getNewArrowState(container, scroll);
    setArrowState(newState);
}

function createChildClick(child: Element, setArrowState: SetArrowState): () => void {
    return () => {
        const container = child.parentElement;
        if (container === null) {
            return;
        }
        const root = container.parentElement;
        if (root === null) {
            return;
        }
        const childRect = child.getBoundingClientRect();
        const { leftArrow, rightArrow } = getControls(root);
        const containerRect = container.getBoundingClientRect();
        const leftArrowRect = leftArrow.getBoundingClientRect();
        const leftEdge = isDisplayed(leftArrow) ? leftArrowRect.right : containerRect.left;
        if (isClipped(childRect, leftEdge)) {
            const offset = leftEdge - childRect.left + 5;
            const newScroll = container.scrollLeft - offset;
            callScroll(container, setArrowState, newScroll);
        }
        const rightArrowRect = rightArrow.getBoundingClientRect();
        const rightEdge = isDisplayed(rightArrow) ? rightArrowRect.left : containerRect.right;
        if (isClipped(childRect, rightEdge)) {
            const offset = childRect.right - rightEdge + 5;
            const newScroll = container.scrollLeft + offset;
            callScroll(container, setArrowState, newScroll);
        }
    };
}

function createArrowClick(container: HTMLDivElement, direction: Extract<ArrowState, "left" | "right">, setArrowState: SetArrowState): () => void {
    const sign = direction === "right" ? 1 : -1;
    const offset = container.getBoundingClientRect().width * 0.8 * sign;
    return () => {
        const newScroll = container.scrollLeft + offset;
        callScroll(container, setArrowState, newScroll);
    };
}

function onResize(container: HTMLDivElement, setArrowState: SetArrowState): void {
    const newState = getNewArrowState(container, container.scrollLeft);
    setArrowState(newState);
}

function setupElement(element: HTMLDivElement, setArrowState: SetArrowState): void {
    const { leftArrow, container, rightArrow } = getControls(element);
    const leftArrowClick = createArrowClick(container, "left", setArrowState);
    const rightArrowClick = createArrowClick(container, "right", setArrowState);
    leftArrow.addEventListener("click", leftArrowClick);
    rightArrow.addEventListener("click", rightArrowClick);
    for (let index = 0; index < container.children.length; index++) {
        const child = container.children[index];
        const onClick = createChildClick(child, setArrowState);
        child.addEventListener("click", onClick);
        child.classList.add(accessClassName(styles, "containerItem"));
    }
    const newState = getNewArrowState(container, container.scrollLeft);
    setArrowState(newState);
    window.addEventListener("resize", () => onResize(container, setArrowState));
}

function useScrollArrows(): [ArrowState, React.RefCallback<HTMLDivElement>] {
    const [arrowState, setArrowState] = useState<ArrowState>("none");
    const ref = useCallback((element: HTMLDivElement | null) => {
        if (element !== null) {
            setupElement(element, setArrowState);
        }
    }, []);
    return [arrowState, ref];
}

export const CategorySelector: React.VFC<ElementPropertySelectorProps> = ({ children }) => {
    const [state, ref] = useScrollArrows();
    const container = ["container"];
    const leftArrow = ["arrow", "leftArrow"];
    const rightArrow = ["arrow", "rightArrow"];
    switch (state) {
        case "left":
            rightArrow.push("hide");
            break;
        case "right":
            leftArrow.push("hide");
            break;
        case "none":
            container.push("center");
            leftArrow.push("hide");
            rightArrow.push("hide");
            break;
    }
    return (
        <div
            className={accessClassName(styles, "propertySelector")}
            ref={ref}
        >
            <div className={accessClassName(styles, ...leftArrow)}>
                <div className={accessClassName(styles, "arrowIcon")}>
                    <FaChevronLeft />
                </div>
                <div></div>
            </div>
            <div
                className={accessClassName(styles, ...container)}
            >
                {children}
            </div>
            <div className={accessClassName(styles, ...rightArrow)}>
                <div></div>
                <div className={accessClassName(styles, "arrowIcon")}>
                    <FaChevronRight />
                </div>
            </div>
        </div>
    );
};