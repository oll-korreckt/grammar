import { accessClassName, WordViewMode } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimateSharedLayout, motion } from "framer-motion";
import React from "react";
import { IconType } from "react-icons";
import { FaPlus, FaSitemap, FaTrashAlt } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import styles from "./_styles.scss";

export interface WordViewNavBarProps {
    mode?: WordViewMode;
    onModeChange?: (newMode: WordViewMode) => void;
}

interface Item {
    mode: WordViewMode;
    onClick?: () => void;
}

export const WordViewNavBar = makeRefComponent<HTMLDivElement, WordViewNavBarProps>("WordViewNavBar", ({ mode, onModeChange }, ref) => {
    const currentMode = WordViewMode.getDefault(mode);

    function invokeModeChange(newMode: WordViewMode): void {
        if (onModeChange) {
            onModeChange(newMode);
        }
    }

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "wordViewNavBar")}
        >
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
                <Icon className={accessClassName(styles, "icon")}/>
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