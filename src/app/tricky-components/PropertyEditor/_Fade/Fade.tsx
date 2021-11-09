import { accessClassName } from "@app/utils";
import { motion } from "framer-motion";
import React, { useRef, useState } from "react";
import { ChildVariants, DURATION, EVENTS } from "../types";
import styles from "./_styles.scss";

export type FadeType = "fade in" | "fade out";

export interface FadeProperties {
    firstMount?: boolean | undefined;
}

export const FadeIn: React.VFC = () => {
    const [showFade, setShowFade] = useState(false);

    const variants: ChildVariants = {
        hidden: () => {
            console.log("FadeIn - hidden");
            return { opacity: 1 };
        },
        show: () => {
            console.log("FadeIn - show");
            return { opacity: 0, transitionEnd: { width: 0, height: 0 } };
        }
    };

    function invokeDelay(): void {
        setTimeout(() => setShowFade(true), DURATION * 1000 / 2);
    }

    return (
        <motion.div
            className={accessClassName(
                styles,
                "fadeIn",
                showFade ? "fadeOutShow" : "fadeOutHide"
            )}
            variants={variants}
            {...EVENTS}
            onAnimationStart={() => {
                console.log("FadeIn - onAnimationStart");
                invokeDelay();
            }}
            transition={{ delay: DURATION / 2,  duration: DURATION / 2 }}
        >
        </motion.div>
    );
};

type EventName = keyof ChildVariants;

export const FadeOut: React.VFC = () => {
    const [showFadeOut, setShowFadeOut] = useState(false);
    const eventRef = useRef<EventName | undefined>();

    function setFirstEvent(e: EventName): void {
        if (eventRef.current === undefined) {
            eventRef.current = e;
        }
    }

    const variants: ChildVariants = {
        hidden: () => {
            console.log("FadeOut - hidden");
            setFirstEvent("hidden");
            return {};
        },
        show: (fm) => {
            console.log("FadeOut - show", fm);
            setFirstEvent("show");
            return { opacity: 0 };
        },
        exit: (fm) => {
            console.log("FadeOut - exit", fm);
            return { opacity: 1 };
        }
    };

    return (
        <motion.div
            className={accessClassName(
                styles,
                "fadeOut",
                showFadeOut ? "fadeOutShow" : "fadeOutHide"
            )}
            {...EVENTS}
            onAnimationStart={() => {
                console.log("FadeOut - onAnimationStart", eventRef.current);
                if (eventRef.current === "show") {
                    setShowFadeOut(true);
                }
            }}
            onAnimationComplete={() => {
                console.log("FadeOut - onAnimationComplete", eventRef.current);
                if (eventRef.current === "hidden") {
                    eventRef.current = "show";
                } else if (eventRef.current === "show") {
                    setShowFadeOut(false);
                }
            }}
            variants={variants}
            transition={{ duration: DURATION * 0.6 }}
        >
        </motion.div>
    );
};

export interface CanvasProps {
    firstMount: boolean;
}

export const Canvas: React.FC<CanvasProps> = ({ children, firstMount }) => {
    const [hiZ, setHiZ] = useState(firstMount);

    const classes = ["canvas"];
    if (hiZ) {
        classes.push("canvasHiZ");
    }

    function invokeDelay(): void {
        if (hiZ) {
            return;
        }
        setTimeout(() => setHiZ(true), DURATION * 1000 / 2);
    }

    const variants: ChildVariants = {
        hidden: () => {
            console.log("Canvas - hidden");
            return { };

        },
        show: () => {
            console.log("Canvas - show");
            return { };
        },
        exit: () => {
            console.log("Canvas - exit");
            return { };
        }
    };

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            transition={{ duration: DURATION / 2 }}
            onAnimationStart={() => {
                console.log("Canvas - onAnimationStart");
                invokeDelay();
            }}
            {...EVENTS}
            variants={variants}
        >
            {children}
        </motion.div>
    );
};