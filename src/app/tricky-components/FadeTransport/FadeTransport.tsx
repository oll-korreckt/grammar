import { accessClassName } from "@app/utils";
import { motion } from "framer-motion";
import React, { useContext } from "react";
import { FadeSwitchContext } from "../FadeSwitch/FadeSwitch";
import styles from "./_styles.scss";

export interface FadeTransportProps {
    transportId: string;
}

export const FadeTransport: React.FC<FadeTransportProps> = ({ children, transportId }) => {
    const ctx = useContext(FadeSwitchContext);
    console.log(`context: ${ctx.transportId}, child: ${transportId}`);
    const classes = ["transport"];
    if (transportId === ctx.transportId) {
        classes.push("keep");
    }

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            transition={{ duration: ctx.duration }}
            layoutId={transportId}
            layout
        >
            {children}
        </motion.div>
    );
};