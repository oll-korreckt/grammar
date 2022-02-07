import { accessClassName, ErrorToken } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimatePresence, AnimateSharedLayout, motion, Variants } from "framer-motion";
import React, { useLayoutEffect, useState } from "react";
import styles from "./_styles.modules.scss";

export type ErrorListItem = Pick<ErrorToken, "key" | "message">;

export interface ErrorListProps {
    children?: ErrorListItem | ErrorListItem[];
    onItemSelect?: (key: string) => void;
    selectedKey?: string;
    showAnimation?: boolean | undefined;
}

function convertToArray(data: undefined | ErrorListItem | ErrorListItem[]): ErrorListItem[] {
    return data !== undefined
        ? Array.isArray(data) ? data : [data]
        : [];
}

export const ErrorList = makeRefComponent<HTMLDivElement, ErrorListProps>("ErrorList", ({ children, onItemSelect, selectedKey, showAnimation }, ref) => {
    const defShowAnimation: boolean = showAnimation !== undefined ? showAnimation : true;
    const [currShowAnimation, setCurrShowAnimation] = useState<boolean>(defShowAnimation);

    const variants: Variants = {
        initial: { opacity: 0 },
        animate: { opacity: 0.8 },
        exit: { opacity: 0 }
    };

    useLayoutEffect(() => {
        if (currShowAnimation !== defShowAnimation) {
            setCurrShowAnimation(defShowAnimation);
        }
    }, [defShowAnimation, currShowAnimation]);

    const data = convertToArray(children);

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "container")}
        >
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence
                    initial={false}
                >
                    {data.map(({ key, message }) => {
                        const classes = ["item"];
                        if (key === selectedKey) {
                            classes.push("selectedItem");
                        }
                        return (
                            <motion.div
                                key={key}
                                initial="initial"
                                animate="animate"
                                exit="exit"
                                variants={currShowAnimation ? variants : {}}
                                className={accessClassName(styles, ...classes)}
                                layoutId={key}
                                layout="position"
                                onClick={() => onItemSelect && onItemSelect(key)}
                            >
                                {message}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </AnimateSharedLayout>
        </div>
    );
});