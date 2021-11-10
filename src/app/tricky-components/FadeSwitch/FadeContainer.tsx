import { accessClassName, ChildVariants, EVENTS } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { motion } from "framer-motion";
import React, { useContext, useLayoutEffect, useRef, useState } from "react";
import { FadeSwitchContext } from "../FadeSwitch/FadeSwitch";
import styles from "./_styles.scss";

interface FadeProps {
    width?: number;
    height?: number;
}

function getSize(show: boolean, width?: number, height?: number): { width?: number; height?: number; } {
    return show ? { width, height } : { width: 0, height: 0 };
}

const FadeIn: React.VFC<FadeProps> = ({ width, height }) => {
    const { duration } = useContext(FadeSwitchContext);
    const [showFade, setShowFade] = useState(false);

    const variants: ChildVariants = {
        hidden: () => {
            return { opacity: 1 };
        },
        show: () => {
            return { opacity: 0, transitionEnd: { width: 0, height: 0 } };
        }
    };

    function invokeDelay(): void {
        setTimeout(() => setShowFade(true), duration * 1000 / 2);
    }

    return (
        <motion.div
            className={accessClassName(styles, "fadeIn")}
            style={getSize(showFade, width, height)}
            variants={variants}
            {...EVENTS}
            onAnimationStart={() => {
                invokeDelay();
            }}
            transition={{ delay: duration / 2,  duration: duration / 2 }}
        >
        </motion.div>
    );
};

type EventName = keyof ChildVariants;

const FadeOut: React.VFC<FadeProps> = ({ width, height }) => {
    const { duration } = useContext(FadeSwitchContext);
    const [showFadeOut, setShowFadeOut] = useState(false);
    const eventRef = useRef<EventName | undefined>();

    function setFirstEvent(e: EventName): void {
        if (eventRef.current === undefined) {
            eventRef.current = e;
        }
    }

    const variants: ChildVariants = {
        hidden: () => {
            setFirstEvent("hidden");
            return {};
        },
        show: () => {
            setFirstEvent("show");
            return { opacity: 0 };
        },
        exit: () => {
            return { opacity: 1 };
        }
    };

    return (
        <motion.div
            className={accessClassName(styles, "fadeOut")}
            style={getSize(showFadeOut, width, height)}
            {...EVENTS}
            onAnimationStart={() => {
                if (eventRef.current === "show") {
                    setShowFadeOut(true);
                }
            }}
            onAnimationComplete={() => {
                if (eventRef.current === "hidden") {
                    eventRef.current = "show";
                } else if (eventRef.current === "show") {
                    setShowFadeOut(false);
                }
            }}
            variants={variants}
            transition={{ duration: duration * 0.6 }}
        >
        </motion.div>
    );
};

interface CanvasProps extends FadeProps {
    children?: React.ReactNode;
}

const Canvas = makeRefComponent<HTMLDivElement, CanvasProps>("Cavas", ({ children, width, height }, ref) => {
    const { firstMount, duration } = useContext(FadeSwitchContext);
    const [hiZ, setHiZ] = useState(firstMount);

    const classes = ["canvas"];
    if (hiZ) {
        classes.push("canvasHiZ");
    }

    function invokeDelay(): void {
        if (hiZ) {
            return;
        }
        setTimeout(() => setHiZ(true), duration * 1000 / 2);
    }

    const variants: ChildVariants = {
        hidden: () => {
            return { };
        },
        show: () => {
            return { };
        },
        exit: () => {
            return { };
        }
    };

    return (
        <motion.div
            ref={ref}
            className={accessClassName(styles, ...classes)}
            transition={{ duration: duration / 2 }}
            style={{ width, height }}
            onAnimationStart={() => {
                invokeDelay();
            }}
            {...EVENTS}
            variants={variants}
        >
            {children}
        </motion.div>
    );
});

export const FadeContainer: React.FC = ({ children }) => {
    const [size, setSize] = useState<FadeProps>({});
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (ref.current === null || ref.current.parentElement === null) {
            throw "no ref";
        }
        const { width, height } = ref.current.parentElement.getBoundingClientRect();
        setSize({ width, height });
    }, []);

    return (
        <Canvas ref={ref} {...size}>
            <FadeIn {...size} />
            <FadeOut {...size} />
            {children}
        </Canvas>
    );
};