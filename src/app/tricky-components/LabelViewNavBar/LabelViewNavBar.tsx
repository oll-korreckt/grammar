import { accessClassName, LabelFormMode, AnimationIdBuilderUtils, ClickListenerContext, DisplayModeContext, ControlAnimationUtils, ControlAnimationContext } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { PropsWithChildren, useContext } from "react";
import { IconType } from "react-icons";
import { FaPlus, FaSitemap, FaTrashAlt } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import styles from "./_styles.module.scss";

export interface LabelViewNavBarProps {
    mode?: LabelFormMode;
    onModeChange?: (newMode: LabelFormMode) => void;
}

interface Item {
    mode: LabelFormMode;
    onClick?: () => void;
}

export const LabelViewNavBar = makeRefComponent<HTMLDivElement, PropsWithChildren<LabelViewNavBarProps>>("LabelViewNavBar", ({ mode, onModeChange, children }, ref) => {
    const { displayMode } = useContext(DisplayModeContext);
    const currentMode = LabelFormMode.getDefault(mode);

    function invokeModeChange(newMode: LabelFormMode): void {
        if (onModeChange) {
            onModeChange(newMode);
        }
    }

    const animateIdBase = "nav-bar";

    return (
        <div
            ref={ref}
            className={accessClassName(styles, displayMode === "full screen" ? "labelViewNavBar" : "labelViewNavBarPartial")}
        >
            {children}
            <div className={accessClassName(styles, "itemContainer")}>
                <AnimateSharedLayout>
                    <Item
                        icon={FaSitemap}
                        selected={currentMode === "navigate"}
                        animateId={AnimationIdBuilderUtils.extendId(animateIdBase, "navigate")}
                        onClick={() => invokeModeChange("navigate")}
                    >
                        Navigate
                    </Item>
                    <Item
                        icon={FaPlus}
                        selected={currentMode === "add"}
                        animateId={AnimationIdBuilderUtils.extendId(animateIdBase, "add")}
                        onClick={() => invokeModeChange("add")}
                    >
                        Add
                    </Item>
                    <Item
                        icon={RiEdit2Fill}
                        selected={currentMode === "edit.browse" || currentMode === "edit.active"}
                        animateId={AnimationIdBuilderUtils.extendId(animateIdBase, "edit-browse")}
                        onClick={() => invokeModeChange("edit.browse")}
                    >
                        Edit
                    </Item>
                    <Item
                        icon={FaTrashAlt}
                        selected={currentMode === "delete"}
                        animateId={AnimationIdBuilderUtils.extendId(animateIdBase, "delete")}
                        onClick={() => invokeModeChange("delete")}
                    >
                        Delete
                    </Item>
                </AnimateSharedLayout>
            </div>
        </div>
    );
});

interface ItemProps {
    icon: IconType;
    onClick?: () => void;
    selected?: boolean;
    animateId?: string;
    children: string;
}

const Item: React.VFC<ItemProps> = ({ icon, onClick, selected, animateId, children }) => {
    const { activeElement } = useContext(ControlAnimationContext);
    const { onElementClick } = useContext(ClickListenerContext);
    const Icon = icon;

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);
    const iconClasses = ["icon"];
    const childrenClasses = ["children"];
    if (isAnimating) {
        iconClasses.push("iconAnimate");
        childrenClasses.push("childrenAnimate");
    }

    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, "itemContent")}
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
                        layout
                        layoutId="underline"
                    />
                }
            </div>
        </div>
    );
};