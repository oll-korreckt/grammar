import { accessClassName, Stage } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { AnimateSharedLayout, motion } from "framer-motion";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./_styles.modules.scss";

export interface EditNavBarProps {
    stage: Stage;
    enabledStages?: ["input"] | ["input", "label"];
    onStageClick?: (stage: Stage) => void;
    onBackClick?: () => void;
}

interface Item {
    label: string;
    stage: Stage;
}

export const EditNavBar = makeRefComponent<HTMLDivElement, EditNavBarProps>("EditNavBar", ({ stage, enabledStages, onStageClick, onBackClick }, ref) => {
    const enabledStagesSet: Set<Stage> = enabledStages !== undefined
        ? new Set(enabledStages)
        : new Set(["input"]);
    const items: Item[] = [
        { label: "Input", stage: "input" },
        { label: "Label", stage: "label" }
    ];

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "container")}
        >
            <div
                onClick={onBackClick}
                className={accessClassName(styles, "back")}
            >
                <FaArrowLeft />
            </div>
            <div className={accessClassName(styles, "stageContainer")}>
                <AnimateSharedLayout>
                    {items.map((item) => {
                        return (
                            <Item
                                key={item.stage}
                                selected={item.stage === stage}
                                enabled={enabledStagesSet.has(item.stage)}
                                onClick={() => onStageClick && onStageClick(item.stage)}
                            >
                                {item.label}
                            </Item>
                        );
                    })}
                </AnimateSharedLayout>
            </div>
        </div>
    );
});

interface ItemProps {
    children: string;
    onClick?: () => void;
    enabled?: boolean | undefined;
    selected?: boolean | undefined;
}

const Item: React.VFC<ItemProps> = ({ children, onClick, enabled, selected }) => {
    return (
        <div
            onClick={onClick}
            className={accessClassName(
                styles,
                "item",
                enabled ? "enabledItem" : "disabledItem"
            )}
        >
            {children}
            {selected && <Underline />}
        </div>
    );
};

const Underline: React.VFC = () => {
    return (
        <motion.div
            className={accessClassName(styles, "underline")}
            layout={true}
            layoutId="underline"
            initial={false}
            transition={{ duration: 0.3 }}
        />
    );
};