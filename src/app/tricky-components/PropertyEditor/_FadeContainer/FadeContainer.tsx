import { accessClassName } from "@app/utils";
import { motion, useIsPresent } from "framer-motion";
import React from "react";
import { DURATION } from "../types";
import { FadeIn, FadeOut } from "../_Fade/Fade";
import styles from "./_styles.scss";

// export interface FadeContainerProps {
// }

export const FadeContainer: React.FC = ({ children }) => {
    const isPresent = useIsPresent();
    const classes = ["fadeContainer"];
    if (isPresent) {
        classes.push("display");
    } else {
        classes.push("fadeOut");
    }
    console.log(isPresent);

    return (
        <motion.div
            initial="hidden"
            animate="show"
            exit="exit"
        >
            <FadeOut/>
            <motion.div
                className={accessClassName(styles, ...classes)}
                variants={{
                    hidden: () => {
                        console.log("hidden");
                        return { opacity: 0 };
                    },
                    show: () => {
                        console.log("show");
                        return { opacity: 1 };
                    }
                }}
                transition={{ duration: DURATION }}
            >
                {children}
            </motion.div>
        </motion.div>
    );
};