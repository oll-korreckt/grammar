import { accessClassName } from "@app/utils";
import { motion, useIsPresent } from "framer-motion";
import React, { useState } from "react";
import { FaTimes } from "react-icons/fa";
import { ChildVariants, DURATION } from "../types";
import styles from "./_styles.scss";

export interface PropertyProps {
    onClick?: () => void;
    onCancel?: () => void;
    propertyKey?: string;
    children: string;
}

function getVariants(property: string | undefined, setKeep?: (value: boolean) => void): ChildVariants {
    if (property === undefined) {
        return {};
    }
    return {
        show: (p) => {
            if (p === property) {
                return { zIndex: 2 };
            }
            return {};
        },
        exit: (p) => {
            console.log("exit triggered");
            if (p === property) {
                setKeep && setKeep(true);
                return { zIndex: 2 };
            }
            return {  };
        }
    };
}

export const Property: React.VFC<PropertyProps> = ({ onClick, onCancel, children, propertyKey }) => {
    const [keep, setKeep] = useState(false);
    const isPresent = useIsPresent();
    const classes = ["property"];
    if (!isPresent) {
        classes.push("keep");
    }
    console.log(classes);

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            layoutId={propertyKey}
            variants={{
                show: () => {
                    console.log("Property - show");
                    return { zIndex: 4 };
                },
                exit: () => {
                    console.log("Property - exit");
                    return { zIndex: 4 };
                }
            }}
            // variants={getVariants(propertyKey, setKeep)}
            transition={{ duration: DURATION }}
            onUpdate={(d) => console.log("Property", d)}
            layout
        >
            <span
                key="text"
                className={accessClassName(styles, "propertyText")}
                onClick={() => onClick && onClick()}
            >
                {children}
            </span>
            {onCancel &&
                <motion.div
                    key="x"
                    className={accessClassName(styles, "xContainer")}
                    onClick={onCancel}
                >
                    <FaTimes/>
                </motion.div>
            }
        </motion.div>
    );
};