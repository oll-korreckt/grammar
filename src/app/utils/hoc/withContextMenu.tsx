import React, { MutableRefObject, Dispatch, SetStateAction, ReactChild, useState, useRef } from "react";
import { Rect, PartialRect, useClientRect, accessClassName } from "@app/utils";
import { RefComponent } from "./higher-order-components";
import styles from "./_styles.scss";
import { useOutsideClick } from "../hooks";

function callDispatch<TElement extends HTMLElement>(instance: TElement | null, dispatch: MutableRefObject<Dispatch<SetStateAction<Rect | undefined>> | undefined>): void {
    if (instance && dispatch.current) {
        const { top, left, width, height } = instance.getBoundingClientRect();
        dispatch.current({
            top: top,
            left: left,
            width: width,
            height: height
        });
    }
}

export function withContextMenu<TElement extends HTMLElement, TProps>(Component: RefComponent<TElement, TProps>, ContextMenu: React.VFC): RefComponent<TElement, TProps> {
    const output = React.forwardRef<TElement, TProps>((props, ref) => {
        const dispatch = useRef<Dispatch<SetStateAction<Rect | undefined>>>();
        let newRef: React.Ref<TElement>;
        if (ref === null) {
            newRef = (i) => callDispatch(i, dispatch);
        } else if (typeof ref === "object") {
            newRef = (i) => {
                ref.current = i;
                callDispatch(i, dispatch);
            };
        } else if (typeof ref === "function") {
            newRef = (i) => {
                ref(i);
                callDispatch(i, dispatch);
            };
        } else {
            throw "Unexpected ref. Received a value that is not null, an object, or a function.";
        }
        return (
            <>
                <Component {...props} ref={newRef} />
                <ContextMenuContainer dispatch={dispatch}>
                    <ContextMenu />
                </ContextMenuContainer>
            </>
        );
    });
    output.displayName = `withContextMenu(${Component.displayName})`;
    return output;
}

interface ContextMenuContainerProps {
    children: ReactChild;
    dispatch: React.MutableRefObject<React.Dispatch<React.SetStateAction<Rect | undefined>> | undefined>;
}

const ContextMenuContainer: React.VFC<ContextMenuContainerProps> = ({ children, dispatch }) => {
    const [targetRect, setTargetRect] = useState<Rect | undefined>();
    dispatch.current = setTargetRect;
    const [display, setDisplay] = useState(true);
    const [selfRect, rectRef] = useClientRect();
    const outsideClickRef = useOutsideClick<HTMLDivElement>(() => display && setDisplay(false));

    let style: { top: number; left: number; } | undefined;
    if (targetRect !== undefined && selfRect !== undefined) {
        const placement = placeMenu(
            targetRect,
            selfRect,
            {
                width: window.innerWidth,
                height: window.innerHeight
            },
            5
        );
        style = { top: placement.top, left: placement.left };
    }
    const classNames = ["contextMenuContainer"];
    if (!display) {
        classNames.push("hide");
    }
    return (
        <div
            className={accessClassName(styles, ...classNames)}
            ref={rectRef}
            style={style}
        >
            <div ref={outsideClickRef}>
                {children}
            </div>
        </div>
    );
};

export type VerticalPlacementType =
    | "aboveTarget"
    | "belowTarget"
    | "centerWindow";
export type HorizontalPlacementType =
    | "centerTarget"
    | "leftTarget"
    | "rightTarget"
    | "centerWindow";
export type MenuPlacement = {
    top: number;
    vType: VerticalPlacementType;
    left: number;
    hType: HorizontalPlacementType;
};

export function placeMenu(target: Rect, menu: PartialRect, win: PartialRect, offset: number): MenuPlacement {
    function calcTop(): [number, VerticalPlacementType] {
        function verticalFit(suggestedValue: number): boolean {
            return suggestedValue + menu.height < win.height
                && suggestedValue > 0;
        }

        if (menu.height > win.height) {
            throw "Cannot display menu with height greater than window";
        }
        const below = target.top + target.height + offset;
        if (verticalFit(below)) {
            return [below, "belowTarget"];
        }
        const above = target.top - menu.height - offset;
        if (verticalFit(above)) {
            return [above, "aboveTarget"];
        }
        const center = 0.5 * (win.height - menu.height);
        if (!verticalFit(center)) {
            throw "";
        }
        return [center, "centerWindow"];
    }

    function calcLeft(): [number, HorizontalPlacementType] {
        function leftFit(suggestedValue: number): boolean {
            return suggestedValue > 0;
        }
        function rightFit(suggestedValue: number): boolean {
            return suggestedValue + menu.width < win.width;
        }
        function horizontalFit(suggestedValue: number): boolean {
            return leftFit(suggestedValue) && rightFit(suggestedValue);
        }

        if (menu.width > win.width) {
            throw "Cannot display menu with width greater than window";
        }
        const targetCenter = target.left + (0.5 * target.width) - (0.5 * menu.width);
        if (horizontalFit(targetCenter)) {
            return [targetCenter, "centerTarget"];
        }
        if (!leftFit(targetCenter)) {
            const output = offset;
            if (horizontalFit(output)) {
                return [output, "leftTarget"];
            }
        } else {
            const output = win.width - (menu.width + offset);
            if (horizontalFit(output)) {
                return [output, "rightTarget"];
            }
        }
        const center = 0.5 * (win.width - menu.width);
        return [center, "centerWindow"];
    }

    const top = calcTop();
    const left = calcLeft();
    return {
        top: top[0],
        vType: top[1],
        left: left[0],
        hType: left[1]
    };
}