import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { ElementType, elementTypeLists } from "@domain/language";
import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { IconType } from "react-icons";
import { FaLayerGroup } from "react-icons/fa";
import styles from "./_styles.scss";

export interface AddMenuProps {
    menuItems?: MenuItems;
    selectedItem?: Exclude<ElementType, "word">;
    onSelectedItemChange?: (newItem: Exclude<ElementType, "word">) => void;
}

type CategoryItems<T extends keyof typeof elementTypeLists> = (typeof elementTypeLists)[T][number];

export interface MenuItems {
    category?: CategoryItems<"partOfSpeech">[];
    phrase?: CategoryItems<"phrase">[];
    clause?: CategoryItems<"clause">[];
    coordinated?: (CategoryItems<"coordPartOfSpeech"> | CategoryItems<"coordPhrase"> | CategoryItems<"coordClause">)[];
}

const keyOrder: (keyof MenuItems)[] = ["category", "phrase", "clause", "coordinated"];

function getSelectedCategory(menuItems: MenuItems, selectedItem: Exclude<ElementType, "word"> | undefined): (keyof MenuItems) | undefined {
    if (selectedItem === undefined) {
        return undefined;
    }
    for (let index = 0; index < keyOrder.length; index++) {
        const key = keyOrder[index];
        const categoryItems = menuItems[key] as string[];
        if (categoryItems === undefined) {
            continue;
        }
        if (categoryItems.includes(selectedItem)) {
            return key;
        }
    }
    return undefined;
}

function initActiveCategory(menuItems: MenuItems, selectedCategory: (keyof MenuItems) | undefined): keyof MenuItems {
    if (selectedCategory !== undefined) {
        return selectedCategory;
    }
    for (let index = 0; index < keyOrder.length; index++) {
        const key = keyOrder[index];
        if (menuItems[key] !== undefined) {
            return key;
        }
    }
    throw "Received empty menuItems input";
}

export const AddMenu = makeRefComponent<HTMLDivElement, AddMenuProps>("AddMenu", ({ menuItems, selectedItem, onSelectedItemChange }, ref) => {
    const currMenuItems: MenuItems = menuItems !== undefined ? menuItems : {};
    const selectedCategory = getSelectedCategory(currMenuItems, selectedItem);
    const [activeCategory, setActiveCategory] = useState<keyof MenuItems>(initActiveCategory(currMenuItems, selectedCategory));
    const activeItems = currMenuItems[activeCategory] as Exclude<ElementType, "word">[];

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "addMenu")}
        >
            <div className={accessClassName(styles, "categories")}>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "category"}
                    enabled={currMenuItems.category !== undefined}
                    onClick={() => setActiveCategory("category")}
                >
                    Category
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "phrase"}
                    enabled={currMenuItems.phrase !== undefined}
                    onClick={() => setActiveCategory("phrase")}
                >
                    Phrase
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "clause"}
                    enabled={currMenuItems.clause !== undefined}
                    onClick={() => setActiveCategory("clause")}
                >
                    Clause
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "coordinated"}
                    enabled={currMenuItems.coordinated !== undefined}
                    onClick={() => setActiveCategory("coordinated")}
                >
                    Coord.
                </Category>
            </div>
            <div className={accessClassName(styles, "items")}>
                {activeItems.map((item) => {
                    const data = ElementDisplayInfo.getDisplayInfo(item);
                    const name = ElementDisplayInfo.getAbbreviatedName(data);
                    return (
                        <Item
                            key={item}
                            header={data.header}
                            onClick={() => onSelectedItemChange && onSelectedItemChange(item)}
                        >
                            {name}
                        </Item>
                    );
                })}
            </div>
        </div>
    );
});

interface CategoryProps {
    icon: IconType;
    active: boolean;
    enabled: boolean;
    onClick?: () => void;
    children: string;
}

const Category: React.VFC<CategoryProps> = ({ icon, active, enabled, onClick, children }) => {
    const Icon = icon;
    return (
        <div
            className={accessClassName(
                styles,
                "category",
                enabled ? "categoryEnabled" : "categoryDisabled"
            )}
            onClick={() => onClick && onClick()}
        >
            <Icon className={accessClassName(styles, "categoryIcon")}/>
            <div className={accessClassName(styles, "categoryChildren")}>
                {children}
                <AnimatePresence
                    initial={false}
                >
                    {active &&
                        <motion.div
                            className={accessClassName(styles, "categoryUnderline")}
                            initial={{ width: 0 }}
                            animate={{ width: "100%" }}
                        />
                    }
                </AnimatePresence>
            </div>
        </div>
    );
};

interface ItemProps {
    onClick?: () => void;
    selected?: boolean;
    header: string;
    children: string;
}

const Item: React.VFC<ItemProps> = ({ onClick, selected, header, children }) => {
    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, "itemContent")}
                onClick={() => onClick && onClick()}
            >
                <div className={accessClassName(styles, "itemSymbol")}>
                    <div className={accessClassName(styles, "itemHeader")}>
                        {header}
                    </div>
                    <div className={accessClassName(styles, "itemChildren")}>
                        {children}
                        {selected &&
                            <div className={accessClassName(styles, "itemUnderline")}/>
                        }
                    </div>
                </div>
            </div>
        </div>
    );
};