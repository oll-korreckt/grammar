import { accessClassName } from "@app/utils";
import { motion } from "framer-motion";
import React, { useContext } from "react";
import { FadeContainerContext } from "../FadeSwitch/FadeContainer";
import { FadeSwitchContext } from "../FadeSwitch/FadeSwitch";
import styles from "./_styles.scss";

export interface FadeTransportProps {
    transportId: string;
}

export const FadeTransport: React.FC<FadeTransportProps> = ({ children, transportId }) => {
    const switchContext = useContext(FadeSwitchContext);
    const containerContext = useContext(FadeContainerContext);
    const classes = ["transport"];
    let render = true;
    if (switchContext.fadeActive) {
        if (containerContext.index === switchContext.targetChild) {
            if (transportId !== switchContext.transportId) {
                /*
                    render all FadeTransports except the active one on the target
                    Canvas as normal divs in order to prevent AnimateSharedLayout
                    from performing unintended animations. Once the fade animation
                    is completed, FadeSwitch will set fadeActive to false in order
                    to allow all the new FadeTransports on the target Canvas to
                    re-render themselves as motion.divs.
                */
                render = false;
            } else {
                classes.push("keep");
            }
        } else {
            if (transportId === switchContext.transportId) {
                classes.push("hide");
            }
        }
    }

    return (
        <>
            {render
                ?
                <motion.div
                    className={accessClassName(styles, ...classes)}
                    transition={{ duration: switchContext.duration }}
                    layoutId={transportId}
                    layout="position"
                >
                    {children}
                </motion.div>
                :
                <div
                    className={accessClassName(styles, ...classes)}
                >
                    {children}
                </div>
            }
        </>
    );
};