import { accessClassName } from "@app/utils";
import { makeRefComponent, withClassNameProp } from "@app/utils/hoc";
import { ElementCategory } from "@domain/language";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import { FaLayerGroup, FaAngleUp } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface NavigateMenuProps {
    category?: ElementCategory;
    onCategoryChange?: (newCat: ElementCategory) => void;
    enableUpLevel?: boolean | undefined;
    onUpLevel?: () => void;
}

export const NavigateMenu = makeRefComponent<HTMLDivElement, PropsWithChildren<NavigateMenuProps>>("NavigateMenu", ({ category, onCategoryChange, enableUpLevel, onUpLevel }, ref) => {
    const defaultCategory = ElementCategory.getDefault(category);

    function invokeCategoryChange(newCat: ElementCategory): void {
        if (onCategoryChange) {
            onCategoryChange(newCat);
        }
    }

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "navigateMenu")}
        >
            <div className={accessClassName(styles, "upContainer")}>
                <ExtendedItem
                    icon={FaAngleUp}
                    onClick={() => onUpLevel && onUpLevel()}
                    className={accessClassName(
                        styles,
                        ...(enableUpLevel ? [] : ["disableUpLevel"])
                    )}
                >
                    Up
                </ExtendedItem>
                <div className={accessClassName(styles, "border")} />
            </div>
            <div className={accessClassName(styles, "categoryContainer")}>
                <AnimateSharedLayout type="crossfade">
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "word"}
                        onClick={() => invokeCategoryChange("word")}
                    >
                        Word
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "partOfSpeech"}
                        onClick={() => invokeCategoryChange("partOfSpeech")}
                    >
                        Category
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "phrase"}
                        onClick={() => invokeCategoryChange("phrase")}
                    >
                        Phrase
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "clause"}
                        onClick={() => invokeCategoryChange("clause")}
                    >
                        Clause
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

const Item = makeRefComponent<HTMLDivElement, ItemProps>("Item", ({ icon, onClick, selected, children }, ref) => {
    const Icon = icon;
    return (
        <div
            ref={ref}
            className={accessClassName(styles, "item")}
        >
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
});

const ExtendedItem = withClassNameProp(Item);