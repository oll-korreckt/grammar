import React, { useEffect, useState } from "react";
import { AnimatePresence, HTMLMotionProps, motion } from "framer-motion";
import styles from "./_styles.module.scss";
import { accessClassName } from "@app/utils";

export interface AnimateThenDisappearProps {
    start: HTMLMotionProps<"div">["animate"];
    end: HTMLMotionProps<"div">["exit"];
    transition?: HTMLMotionProps<"div">["transition"];
    children: React.ReactNode;
}

export const AnimateThenDisappear: React.VFC<AnimateThenDisappearProps> = ({ start, end, transition, children }) => {
    const [run, setRun] = useState(false);

    useEffect(() => {
        setRun(true);
    }, [start, end, children]);

    useEffect(() => {
        if (run) {
            setRun(false);
        }
    }, [run]);

    return (
        <AnimatePresence>
            {run &&
                <motion.div
                    className={accessClassName(styles, "container")}
                    animate={start}
                    exit={end}
                    transition={transition}
                >
                    {children}
                </motion.div>
            }
        </AnimatePresence>
    );
};