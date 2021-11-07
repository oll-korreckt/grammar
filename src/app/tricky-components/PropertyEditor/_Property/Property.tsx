import { accessClassName } from "@app/utils";
import { motion, useIsPresent } from "framer-motion";
import React, { useContext, useState } from "react";
import { FaTimes } from "react-icons/fa";
import { AnimationContext, ChildVariants, DURATION } from "../types";
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
            console.log("custom value", p);
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
    const { activeProperty } = useContext(AnimationContext);
    // const isPresent = useIsPresent();
    const classes = ["property"];
    if (propertyKey !== undefined && activeProperty === propertyKey) {
        classes.push("keep");
    }
    console.log(classes);

    return (
        <motion.div
            className={accessClassName(styles, ...classes)}
            layoutId={propertyKey}
            variants={{
                show: () => {
                    console.log("Property - show", activeProperty);
                    // return { zIndex: 3 };
                    return {};
                },
                exit: () => {
                    console.log("Property - exit", activeProperty);
                    return {};
                    // return propertyKey !== undefined && p === propertyKey
                    //     ? { zIndex: 3 }
                    //     : { };
                    // if (p === propertyKey) {
                        
                    // }
                    // return { zIndex: 3 };
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