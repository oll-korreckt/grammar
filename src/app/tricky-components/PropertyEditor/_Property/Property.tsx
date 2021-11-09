import { accessClassName } from "@app/utils";
import { motion, Transition, useIsPresent } from "framer-motion";
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { AnimationContext, ChildVariants, DURATION, EVENTS } from "../types";
import styles from "./_styles.scss";

type PropertyClick = (id: string) => void;

export interface PropertyProps {
    onSelect?: PropertyClick;
    onCancel?: PropertyClick;
    propertyId?: string;
    children: string;
}

interface Widths {
    total: number;
    text: number;
    cancel: number;
}

interface PropertyVariants {
    text: ChildVariants;
    cancel: ChildVariants;
}

function getVariants(widths: Widths | undefined, hasCancel: boolean): PropertyVariants {
    let left: number;
    let opacity: number;
    if (widths === undefined || hasCancel) {
        left = 0;
        opacity = 1;
    } else {
        left = widths.cancel / 2;
        opacity = 0;
    }

    const immediate: Transition = { duration: DURATION };
    const delayed: Transition = { duration: DURATION / 2, delay: DURATION / 2 };

    let textTransition: Transition;
    let cancelTransition: Transition;
    if (!hasCancel) {
        textTransition = immediate;
        cancelTransition = delayed;
    } else {
        textTransition = delayed;
        cancelTransition = immediate;
    }

    return {
        text: {
            exit: (a) => {
                console.log("text exit:", a);
                return {
                    opacity: 0,
                    transition: textTransition
                };
            }
        },
        cancel: {
            exit: (a) => {
                console.log("cancel exit:", a);
                return {
                    opacity,
                    transition: cancelTransition
                };
            }
        }
    };
}

export const Property: React.VFC<PropertyProps> = ({ onSelect, onCancel, children, propertyId }) => {
    const textRef = useRef<HTMLDivElement>(null);
    const cancelRef = useRef<HTMLDivElement>(null);
    const [widths, setWidths] = useState<Widths>();
    const { activeProperty } = useContext(AnimationContext);

    useLayoutEffect(() => {
        if (textRef.current === null || cancelRef.current === null) {
            throw "refs not defined";
        }
        const textWidth = textRef.current.getBoundingClientRect().width;
        const cancelWidth = cancelRef.current.getBoundingClientRect().width;
        setWidths({
            total: textWidth + cancelWidth,
            text: textWidth,
            cancel: cancelWidth
        });
    }, []);

    const hasCancel = onCancel !== undefined;
    const id = propertyId !== undefined ? propertyId : children;
    const zIndex = activeProperty === id ? 3 : 0;

    return (
        <motion.div
            className={accessClassName(styles, "property")}
            transition={{ duration: DURATION }}
            style={{ zIndex }}
            layoutId={id}
            layout
        >
            <motion.div
                ref={textRef}
                style={{
                    left: !hasCancel && widths ? widths.cancel / 2 : 0
                }}
                className={accessClassName(styles, "propertyText")}
                onClick={() => onSelect && onSelect(id)}
            >
                {children}
            </motion.div>
            <motion.div
                ref={cancelRef}
                style={{
                    opacity: hasCancel ? 1 : 0,
                    pointerEvents: hasCancel ? "initial" : "none"
                }}
                className={accessClassName(styles, "propertyCancel")}
                onClick={() => onCancel && onCancel(id)}
            >
                <FaTimes className={accessClassName(styles, "faTimes")} />
            </motion.div>
        </motion.div>
    );
};