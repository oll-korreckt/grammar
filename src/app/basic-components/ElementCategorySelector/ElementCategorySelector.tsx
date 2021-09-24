import { accessClassName } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementCategory } from "@domain/language";
import React from "react";
import { IconType } from "react-icons";
import { FaLayerGroup } from "react-icons/fa";
import styles from "./_styles.scss";

export interface ElementCategorySelectorProps {
    onCategorySelect?: (category: ElementCategory) => void;
    category: ElementCategory;
}

interface ButtonData {
    icon: IconType;
    category: ElementCategory;
    text: string;
}

export const ElementCategorySelector = makeRefComponent<HTMLDivElement, ElementCategorySelectorProps>("ElementCategorySelector", ({ onCategorySelect, ...rest }, ref) => {
    const elementCategory = rest.category;
    const callback = (category: ElementCategory) => onCategorySelect && onCategorySelect(category);
    const filterFn = ElementCategory.getLayerFilter(elementCategory);
    const data: ButtonData[] = [
        { icon: FaLayerGroup, category: "word", text: "Word" },
        { icon: FaLayerGroup, category: "partOfSpeech", text: "Part of Speech" },
        { icon: FaLayerGroup, category: "phrase", text: "Phrase" },
        { icon: FaLayerGroup, category: "clause", text: "Clause" }
    ];
    return (
        <div className={accessClassName(styles, "categorySelector")} ref={ref}>
            {data.map(({ icon, category, text }) => {
                const classNames: string[] = [];
                const onClick = () => callback(category);
                if (category === elementCategory) {
                    classNames.push("selected");
                } else if (filterFn(category)) {
                    classNames.push("inFilter");
                } else {
                    classNames.push("unselected");
                }
                return (
                    <ExtendedModeSelectorItem
                        key={category}
                        icon={icon}
                        onClick={onClick}
                        className={accessClassName(styles, ...classNames)}
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

const CategorySelectorItem = makeRefComponent<HTMLDivElement, ModeSelectorItemProps>("CategorySelectorItem", ({ children, icon }, ref) => {
    const Icon = icon;
    return (
        <div ref={ref} className={accessClassName(styles, "categorySelectorItem")}>
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
    withClassNameProp(CategorySelectorItem),
    "click"
);