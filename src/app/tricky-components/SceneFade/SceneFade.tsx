import { accessClassName } from "@app/utils";
import React from "react";
import { motion } from "framer-motion";
import styles from "./_styles.module.scss";

export interface SceneFadeProps {
    duration?: number;
    onComplete?: () => void;
}

export const SceneFadeOut: React.FC<SceneFadeProps> = ({ duration, onComplete, children }) => {
    return (
        <div className={accessClassName(styles, "parent")}>
            <motion.div
                className={accessClassName(styles, "fade")}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration }}
                onAnimationComplete={() => onComplete && onComplete()}
            >
            </motion.div>
            {children}
        </div>
    );
};

export const SceneFadeIn: React.FC<SceneFadeProps> = ({ duration, onComplete, children }) => {
    return (
        <div className={accessClassName(styles, "parent")}>
            <motion.div
                className={accessClassName(styles, "fade")}
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration }}
                onAnimationComplete={() => onComplete && onComplete()}
            >
            </motion.div>
            {children}
        </div>
    );
};