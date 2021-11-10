import { accessClassName } from "@app/utils";
import { motion, useIsPresent } from "framer-motion";
import React, { useContext } from "react";
import { FadeSwitchContext } from "../FadeSwitch/FadeSwitch";
import styles from "./_styles.scss";

export interface FadeTransportProps {
    transportId: string;
}

export const FadeTransport: React.FC<FadeTransportProps> = ({ children, transportId }) => {
    const ctx = useContext(FadeSwitchContext);
    const isPresent = useIsPresent();
    const classes = ["transport"];
    if (transportId === ctx.transportId) {
        classes.push("keep");
    }
    if (!isPresent) {
        classes.push("hide");
    }

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            transition={{ duration: ctx.duration }}
            layoutId={transportId}
            layout="position"
        >
            {children}
        </motion.div>
    );
};