import { accessClassName, ErrorToken } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import React from "react";
import styles from "./_styles.scss";

export type ErrorListItem = Pick<ErrorToken, "key" | "message">;

export interface ErrorListProps {
    children?: ErrorListItem | ErrorListItem[];
    onItemSelect?: (key: string) => void;
    selectedKey?: string;
}

function convertToArray(data: undefined | ErrorListItem | ErrorListItem[]): ErrorListItem[] {
    return data !== undefined
        ? Array.isArray(data) ? data : [data]
        : [];
}

export const ErrorList = makeRefComponent<HTMLDivElement, ErrorListProps>("ErrorList", ({ children, onItemSelect, selectedKey }, ref) => {
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
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 0.8 }}
                                exit={{ opacity: 0 }}
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