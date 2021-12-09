import { NavBar, NavBarProps } from "@app/basic-components/NavBar";
import { accessClassName, Stage } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import { AnimatePresence, motion, Variants } from "framer-motion";
import React from "react";
import styles from "./_styles.scss";

export interface NavBarContainerProps extends NavBarProps {
    children: [React.ReactNode, React.ReactNode];
}

interface Item {
    stage: Stage;
    child: React.ReactNode;
}

const variants: Variants = {
    initial: (stage: Stage) => {
        return { x: stage === "input" ? "-100vw" : "100vw" };
    },
    exit: (stage: Stage) => {
        return { x: stage === "input" ? "100vw" : "-100vw" };
    }
};

export const NavBarContainer: React.VFC<NavBarContainerProps> = ({ children, ...rest }) => {
    const currentStage = rest.stage;
    const [inputChild, labelChild] = children;
    const items: Item[] = [
        {
            stage: "input",
            child: inputChild
        },
        {
            stage: "label",
            child: labelChild
        }
    ];
    return (
        <div className={accessClassName(styles, "container")}>
            <ExtendedNavBar {...rest} />
            <AnimatePresence
                initial={false}
                custom={currentStage}
            >
                {items.filter(({ stage }) => stage === currentStage).map(({ stage, child }) => {
                    return (
                        <motion.div
                            key={stage}
                            initial="initial"
                            animate={{ x: "0" }}
                            exit="exit"
                            variants={variants}
                            custom={currentStage}
                            transition={{ duration: 0.5 }}
                            style={{ position: "absolute" }}
                            className={accessClassName(styles, "childContainer")}
                        >
                            {child}
                        </motion.div>
                    );
                })}
            </AnimatePresence>
        </div>
    );
};

const ExtendedNavBar = withClassNameProp(NavBar);