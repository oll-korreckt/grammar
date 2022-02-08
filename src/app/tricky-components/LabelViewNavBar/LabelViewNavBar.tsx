import { accessClassName, LabelFormMode } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { PropsWithChildren } from "react";
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
    const currentMode = LabelFormMode.getDefault(mode);

    function invokeModeChange(newMode: LabelFormMode): void {
        if (onModeChange) {
            onModeChange(newMode);
        }
    }

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "labelViewNavBar")}
        >
            {children}
            <div className={accessClassName(styles, "itemContainer")}>
                <AnimateSharedLayout>
                    <Item
                        icon={FaSitemap}
                        selected={currentMode === "navigate"}
                        onClick={() => invokeModeChange("navigate")}
                    >
                        Navigate
                    </Item>
                    <Item
                        icon={FaPlus}
                        selected={currentMode === "add"}
                        onClick={() => invokeModeChange("add")}
                    >
                        Add
                    </Item>
                    <Item
                        icon={RiEdit2Fill}
                        selected={currentMode === "edit.browse" || currentMode === "edit.active"}
                        onClick={() => invokeModeChange("edit.browse")}
                    >
                        Edit
                    </Item>
                    <Item
                        icon={FaTrashAlt}
                        selected={currentMode === "delete"}
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
    children: string;
}

const Item: React.VFC<ItemProps> = ({ icon, onClick, selected, children }) => {
    const Icon = icon;
    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, "itemContent")}
                onClick={() => onClick && onClick()}
            >
                <Icon className={accessClassName(styles, "icon")} />
                <div className={accessClassName(styles, "children")}>
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