import { accessClassName, AnimationIdBuilderUtils, ClickListenerContext, ControlAnimationContext, ControlAnimationUtils, DisplayModeContext } from "@app/utils";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { useContext } from "react";
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
    const { displayMode } = useContext(DisplayModeContext);
    const defMode = mode !== undefined ? mode : "input";

    return (
        <div className={accessClassName(styles, "navBar")}>
            <div className={accessClassName(styles, displayMode === "full screen" ? "navBarContent" : "navBarContentPartial")}>
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
    const { activeElement } = useContext(ControlAnimationContext);
    const { onElementClick } = useContext(ClickListenerContext);

    const animateId = AnimationIdBuilderUtils.extendId("edit-form-nav-bar", children);

    const Icon = icon;
    const classes = ["itemContent"];
    if (disabled) {
        classes.push("itemContentDisabled");
    }

    const iconClasses = ["itemIcon"];
    const childrenClasses = ["itemChildren"];
    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);
    if (isAnimating) {
        iconClasses.push("animation");
        childrenClasses.push("animation");
    }

    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, ...classes)}
                onClick={() => {
                    onElementClick && onElementClick(animateId);
                    onClick && onClick();
                }}
            >
                <Icon className={accessClassName(styles, ...iconClasses)} />
                <div className={accessClassName(styles, ...childrenClasses)}>
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