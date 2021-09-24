import { accessClassName, WordViewMode } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import React from "react";
import { IconType } from "react-icons";
import { FaSitemap, FaTags, FaTrashAlt } from "react-icons/fa";
import { RiEdit2Fill } from "react-icons/ri";
import styles from "./_styles.scss";
import { Strings } from "@lib/utils";

type ModeChange = (mode: WordViewMode) => void;

export interface ModeSelectorProps {
    onModeChange?: ModeChange;
    mode: WordViewMode;
}

type ButtonData = {
    icon: IconType;
    mode: WordViewMode;
};

function createOnClick(callback: ModeChange | undefined, mode: WordViewMode): () => void {
    return () => callback && callback(mode);
}

export const ModeSelector = makeRefComponent<HTMLDivElement, ModeSelectorProps>("ModeSelector", ({ onModeChange, ...rest }, ref) => {
    const activeMode = rest.mode;
    const data: ButtonData[] = [
        { icon: FaSitemap, mode: "navigate" },
        { icon: FaTags, mode: "label" },
        { icon: RiEdit2Fill, mode: "edit" },
        { icon: FaTrashAlt, mode: "delete" }
    ];
    return (
        <div ref={ref} className={accessClassName(styles, "modeSelector")}>
            {data.map(({ icon, mode }) => {
                const text = Strings.capitalize(mode);
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