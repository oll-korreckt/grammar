import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { ElementCategory } from "@domain/language";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { PropsWithChildren } from "react";
import { IconType } from "react-icons";
import { FaLayerGroup } from "react-icons/fa";
import styles from "./_styles.scss";

export interface NavigateMenuProps {
    category?: ElementCategory;
    onCategoryChange?: (newCat: ElementCategory) => void;
}

export const NavigateMenu = makeRefComponent<HTMLDivElement, PropsWithChildren<NavigateMenuProps>>("NavigateMenu", ({ category, onCategoryChange }, ref) => {
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