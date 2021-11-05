import { accessClassName } from "@app/utils";
import { motion, useIsPresent, Variants, useCycle, usePresence, useAnimation } from "framer-motion";
import { AnimationDefinition } from "framer-motion/types/render/utils/animation";
import React, { useReducer, useRef, useState } from "react";
import { ChildVariants, DURATION } from "../types";
import styles from "./_styles.scss";

export type FadeType = "fade in" | "fade out";

export interface FadeProperties {
    firstMount?: boolean | undefined;
}


// const fadeInVariants: ChildVariants = {
//     // hidden: {
//     //     opacity: 1
//     // },
//     hidden: () => {
//         console.log("fade in - hidden");
//         return { opacity: 1 };
//     },
//     show: () => {
//         console.log("fade in - show");
//         return { opacity: 0 };
//     }
// };

const fadeOutVariants: ChildVariants = {
    hidden: () => {
        console.log("hidden");
        return { opacity: 1, zIndex: 1 };
    },
    show: (v) => {
        console.log("show", v);
        return { opacity: 0, zIndex: 2 };
    },
    exit: () => {
        console.log("exit");
        return { opacity: 1, zIndex: 3 };
    }
};

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

type FadeInCyle = "0" | "hidden";

const duration = 100;

export const FadeIn: React.VFC = () => {
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

    return (
        <motion.div
            className={accessClassName(styles, "fadeIn")}
            variants={variants}
            transition={{ duration: DURATION }}
        >
        </motion.div>
    );
};

export const FadeOut: React.VFC = () => {
    const isPresent = useIsPresent();

    const classes = ["fadeOut"];
    if (isPresent) {
        classes.push("fadeOutHide");
    } else {
        classes.push("fadeOutShow");
    }

    const variants: ChildVariants = {
        show: () => {
            console.log("FadeOut - show");
            return { opacity: 0 };
        },
        exit: () => {
            console.log("FadeOut - exit");
            return { opacity: 1 };
        }
    };

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            variants={variants}
            transition={{ duration: DURATION }}
        >
        </motion.div>
    );
};