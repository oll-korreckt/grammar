import { accessClassName } from "@app/utils";
import { motion, useIsPresent, Variants, useCycle, usePresence, useAnimation } from "framer-motion";
import { AnimationDefinition } from "framer-motion/types/render/utils/animation";
import React, { useReducer, useRef, useState } from "react";
import { ChildVariants, DURATION, EVENTS } from "../types";
import styles from "./_styles.scss";

export type FadeType = "fade in" | "fade out";

export interface FadeProperties {
    firstMount?: boolean | undefined;
}


type State = "mount" | "display" | "unmount";
type Action = "start" | "complete";
type Cycle = "0" | "mount animation" | "display" | "unmount animation";

function reducer(state: State, action: Action): State {
    switch (action) {
        case "start": {
            switch (state) {
                case "mount":
                    return "mount";
                case "display":
                case "unmount":
                    return "unmount";
            }
        }
        case "complete": {
            switch (state) {
                case "mount":
                    return "display";
                case "display":
                case "unmount":
                    return "unmount";
            }
        }
    }
}

// function createInvoke(dispatch: (newState: State) => void): (newState: State) => 

export const Fade: React.VFC<FadeProperties> = ({ firstMount }) => {
    const initialTriggered = useRef(false);
    const isPresent = useIsPresent();
    console.log("isPresent", isPresent);
    const cycleRef = useRef<Cycle>("0");

    const red = "#f00";
    const green = "#0f0";
    const blue = "#00f";

    // const [state, dispatch] = useReducer(reducer, firstMount ? "display" : "mount");
    // console.log(state);
    // const variants: ChildVariants = {
    //     hidden: () => {
    //         initialTriggered.current = true;
    //         // dispatch("")
    //         return { opacity: 1 };
    //     },
    //     show: () => {
    //         console.log("initialTriggered", initialTriggered.current);
    //         return initialTriggered.current
    //             ? { transitionEnd: { zIndex: 22, width: 0, height: 0 } }
    //             : { };
    //     },
    //     exit: () => {
    //         return { opacity: 1 };
    //     }
    // };
    // console.log(state);

    const fuck: ChildVariants = {
        hidden: () => {
            console.log("hidden", cycleRef.current);
            if (cycleRef.current === "0") {
                cycleRef.current = "mount animation";
            }
            return { backgroundColor: red };
        },
        show: () => {
            // return { backgroundColor: "#0f0" };
            console.log("show", cycleRef.current);
            switch (cycleRef.current) {
                case "0": {
                    cycleRef.current = "display";
                    return { backgroundColor: green, width: 0 };
                }
                case "display": {
                    return { backgroundColor: green, width: 0 };
                }
                case "mount animation":
                    // cycleRef will be updated in onAnimationComplete
                    return { backgroundColor: green, transitionEnd: { width: 0 } };
                case "unmount animation":
                    return { backgroundColor: green };
            }
        },
        exit: () => {
            console.log("exit", cycleRef.current);
            return { backgroundColor: blue, width: "10%" };
            switch (cycleRef.current) {
                case "display":
                case "unmount animation":
                    return { transitionEnd: { backgroundColor: "red" } };
                    break;
                default:
                    return {};
            }
        }
    };

    return (
        <motion.div
            // initial="hidden"
            // animate="show"
            // exit="exit"
            className={accessClassName(styles, "debug")}
            variants={fuck}
            transition={{ duration: 1 }}
            onAnimationStart={() => {
                console.log("onAnimationStart");
                // dispatch("start");
            }}
            onAnimationComplete={(d) => {
                if (d === "show") {
                    cycleRef.current = "unmount animation";
                }
                console.log("onAnimationComplete", d);
                // dispatch("complete");
            }}
            onUpdate={(v) => console.log("onUpdate", v)}
            // onUnmount={() => console.log("onUnmount")}
            // onAnimationEnd={() => console.log("onAnimationEnd")}
            // onAnimationStartCapture={() => console.log("onAnimationStartCapture")}
            // onAnimationEndCapture={() => console.log("onAnimationEndCapture")}
            // onAnimationIteration={() => console.log("onAnimationIteration")}
            // onAnimationIterationCapture={() => console.log("onAnimationIterationCapture")}
            // onLayoutAnimationComplete={() => console.log("onLayoutAnimationComplete")}
        >
        </motion.div>
    );
};

const red = "#f00";
const green = "#0f0";
const blue = "#00f";

export const DoubleFade: React.VFC = () => {
    return (
        <>
            <FadeIn/>
            <FadeOut/>
        </>
    );
};

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

    // const eventName = eventRef.current;

    return (
        <motion.div
            className={accessClassName(
                styles,
                "fadeOut",
                // "fadeOutHide"
                showFadeOut ? "fadeOutShow" : "fadeOutHide"
            )}
            {...EVENTS}
            // animate="show"
            // exit="exit"
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
            transition={{ duration: DURATION * 0.51 }}
        >
        </motion.div>
    );
};

export const Canvas: React.FC = ({ children }) => {
    const [hiZ, setHiZ] = useState(false);

    const classes = ["canvas"];
    if (hiZ) {
        classes.push("canvasHiZ");
    }

    function invokeDelay(): void {
        if (hiZ) {
            // setHiZ(false);
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
            // onAnimationComplete={(d) => {
            //     if (d === "exit") {
                    
            //     }
            // }}
            {...EVENTS}
            variants={variants}
        >
            {children}
        </motion.div>
    );
};