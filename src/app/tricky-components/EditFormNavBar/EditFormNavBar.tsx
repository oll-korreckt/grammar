import { accessClassName } from "@app/utils";
import { AnimateSharedLayout, motion } from "framer-motion";
import React from "react";
import { IconType } from "react-icons";
import { FaEdit, FaTag } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface EditFormNavBarProps {
    mode?: "input" | "label";
    transitionDuration?: number;
    onModeSwitch?: (mode: "input" | "label") => void;
    disableLabelMode?: boolean;
}

export const EditFormNavBar: React.VFC<EditFormNavBarProps> = ({ mode, transitionDuration, onModeSwitch, disableLabelMode }) => {
    const defMode = mode !== undefined ? mode : "input";
    return (
        <div className={accessClassName(styles, "navBar")}>
            <div className={accessClassName(styles, "navBarContent")}>
                <AnimateSharedLayout type="crossfade">
                    <Item
                        icon={FaEdit}
                        selected={defMode === "input"}
                        transitionDuration={transitionDuration}
                        onClick={() => onModeSwitch && onModeSwitch("input")}
                    >
                        Input
                    </Item>
                    <Item
                        icon={FaTag}
                        selected={defMode === "label"}
                        transitionDuration={transitionDuration}
                        onClick={() => onModeSwitch && onModeSwitch("label")}
                        disabled={disableLabelMode}
                    >
                        Label
                    </Item>
                </AnimateSharedLayout>
            </div>
        </div>
    );
};

interface ItemProps {
    onClick?: () => void;
    icon: IconType;
    selected?: boolean | undefined;
    transitionDuration?: number;
    children: string;
    disabled?: boolean | undefined;
}

const Item: React.VFC<ItemProps> = ({ onClick, icon, selected, transitionDuration, children, disabled }) => {
    const Icon = icon;
    const classes = ["itemContent"];
    if (disabled) {
        classes.push("itemContentDisabled");
    }
    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, ...classes)}
                onClick={() => onClick && onClick()}
            >
                <Icon className={accessClassName(styles, "itemIcon")} />
                <div className={accessClassName(styles, "itemChildren")}>
                    {children}
                </div>
                {selected &&
                    <motion.div
                        className={accessClassName(styles, "underline")}
                        transition={{ duration: transitionDuration }}
                        layout
                        layoutId="underline"
                    />
                }
            </div>
        </div>
    );
};