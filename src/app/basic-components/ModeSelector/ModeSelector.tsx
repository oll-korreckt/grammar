import { accessClassName, WordViewMode } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import React from "react";
import { IconType } from "react-icons";
import { FaPlus, FaSitemap, FaTrashAlt } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import styles from "./_styles.scss";

type ModeChange = (mode: WordViewMode) => void;

export interface ModeSelectorProps {
    onModeChange?: ModeChange;
    mode: WordViewMode;
}

type ButtonData = {
    icon: IconType;
    mode: WordViewMode;
    text: string;
};

function createOnClick(callback: ModeChange | undefined, mode: WordViewMode): () => void {
    return () => callback && callback(mode);
}

export const ModeSelector = makeRefComponent<HTMLDivElement, ModeSelectorProps>("ModeSelector", ({ onModeChange, ...rest }, ref) => {
    const activeMode = rest.mode;
    const data: ButtonData[] = [
        { icon: FaSitemap, mode: "navigate", text: "Navigate" },
        { icon: FaPlus, mode: "add", text: "Add" },
        { icon: RiEdit2Fill, mode: "edit.browse", text: "Edit" },
        { icon: FaTrashAlt, mode: "delete", text: "Delete" }
    ];
    return (
        <div ref={ref} className={accessClassName(styles, "modeSelector")}>
            {data.map(({ icon, mode, text }) => {
                const callback = createOnClick(onModeChange, mode);
                const className = mode === activeMode ? "selected" : "notSelected";
                return (
                    <ExtendedModeSelectorItem
                        key={mode}
                        icon={icon}
                        className={accessClassName(styles, className)}
                        onClick={callback}
                    >
                        {text}
                    </ExtendedModeSelectorItem>
                );
            })}
        </div>
    );
});

interface ModeSelectorItemProps {
    icon: IconType;
    children: string;
}

const ModeSelectorItem = makeRefComponent<HTMLDivElement, ModeSelectorItemProps>("ModeSelectorItem", ({ children, icon }, ref) => {
    const Icon = icon;
    return (
        <div ref={ref} className={accessClassName(styles, "modeSelectorItem")}>
            <div className={accessClassName(styles, "icon", "center")}>
                <Icon/>
            </div>
            <div className={accessClassName(styles, "iconText", "center")}>
                {children}
            </div>
        </div>
    );
});

const ExtendedModeSelectorItem = withEventProp(
    withClassNameProp(ModeSelectorItem),
    "click"
);