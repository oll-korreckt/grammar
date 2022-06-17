import { accessClassName, ElementDisplayInfo, useUpdateDisplayState, AnimationIdBuilderUtils, ClickListenerContext, ControlAnimationContext, ControlAnimationUtils } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { ElementCategory, ElementType, elementTypeLists } from "@domain/language";
import { AnimatePresence, motion } from "framer-motion";
import React, { useContext, useEffect } from "react";
import { IconType } from "react-icons";
import { FaLayerGroup } from "react-icons/fa";
import hash from "object-hash";
import styles from "./_styles.module.scss";

export interface AddMenuViewProps {
    category?: AddMenuCategory;
    onCategorySelect?: (cat: AddMenuCategory) => void;
    onElementSelect?: (element: Exclude<ElementType, "word">) => void;
    children?: Exclude<ElementType, "word">[];
}

export type AddMenuCategory =
    | "category"
    | "phrase"
    | "clause"
    | "coordinated"
    | "sentence";

const categoryOrder: AddMenuCategory[] = [
    "category",
    "phrase",
    "clause",
    "coordinated",
    "sentence"
];
const categorySorter = createCategorySorter();
const elementSorter = createElementSorter();

function createCategorySorter(): (a: AddMenuCategory, b: AddMenuCategory) => number {
    const sortObj: Record<AddMenuCategory, number> = Object.fromEntries(categoryOrder.map((cat, index) => [cat, index])) as any;
    return (a, b) => {
        const aVal = sortObj[a];
        const bVal = sortObj[b];
        return aVal - bVal;
    };
}

function createElementSorter(): (a: Exclude<ElementType, "word">, b: Exclude<ElementType, "word">) => number {
    function isExcludedWord(element: ElementType): element is Exclude<ElementType, "word"> {
        return element !== "word";
    }
    const entries: [Exclude<ElementType, "word">, number][] = elementTypeLists.element
        .filter(isExcludedWord)
        .map((element, index) => [element, index]);
    const sortObj: Record<Exclude<ElementType, "word">, number> = Object.fromEntries(entries) as any;
    return (a, b) => {
        const aVal = sortObj[a];
        const bVal = sortObj[b];
        return aVal - bVal;
    };
}

function getAvailableCategories(elements: Exclude<ElementType, "word">[] | undefined): AddMenuCategory[] {
    if (elements === undefined) {
        return [];
    }
    const output = new Set<AddMenuCategory>();
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        const category = getAddMenuCategory(element);
        output.add(category);
        if (output.size === categoryOrder.length) {
            return Array.from(output).sort(categorySorter);
        }
    }
    return Array.from(output).sort(categorySorter);
}

function getAddMenuCategory(element: Exclude<ElementType, "word">): AddMenuCategory {
    if (element.startsWith("coordinated")) {
        return "coordinated";
    }
    const category = ElementCategory.getElementCategory(element);
    switch (category) {
        case "word":
            throw `cannot add '${category}' element`;
        case "partOfSpeech":
            return "category";
        case "phrase":
        case "clause":
        case "sentence":
            return category;
    }
}

function getMenuItems(elements: Exclude<ElementType, "word">[] | undefined, activeCategory: AddMenuCategory | undefined): Exclude<ElementType, "word">[] {
    if (elements === undefined || activeCategory === undefined) {
        return [];
    }
    const output: Exclude<ElementType, "word">[] = [];
    for (let index = 0; index < elements.length; index++) {
        const element = elements[index];
        const category = getAddMenuCategory(element);
        if (category === activeCategory) {
            output.push(element);
        }
    }
    return output.sort(elementSorter);
}

export const AddMenuView = makeRefComponent<HTMLDivElement, AddMenuViewProps>("AddMenuView", ({ category, onCategorySelect, onElementSelect, children }, ref) => {
    const { onElementClick } = useContext(ClickListenerContext);
    const availableCategories = getAvailableCategories(children);
    const updateDisplay = useUpdateDisplayState();
    const activeCategory: AddMenuCategory | undefined = category !== undefined
        ? category
        : availableCategories.length > 0
            ? availableCategories[0]
            : undefined;
    const activeItems = getMenuItems(children, activeCategory);

    const childrenHash = children === undefined ? "" : hash(children);
    useEffect(() => {
        updateDisplay({
            type: "add",
            elements: children,
            category
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, childrenHash]);

    const animateIdBase = "add-menu";
    const categoryIdBase = AnimationIdBuilderUtils.extendId(animateIdBase, "category");

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "addMenu")}
        >
            <div className={accessClassName(styles, "categories")}>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "category"}
                    enabled={availableCategories.includes("category")}
                    onClick={() => {
                        onElementClick && onElementClick(AnimationIdBuilderUtils.extendId(categoryIdBase, "category"));
                        onCategorySelect && onCategorySelect("category");
                    }}
                >
                    Category
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "phrase"}
                    enabled={availableCategories.includes("phrase")}
                    onClick={() => {
                        onElementClick && onElementClick(AnimationIdBuilderUtils.extendId(categoryIdBase, "phrase"));
                        onCategorySelect && onCategorySelect("phrase");
                    }}
                >
                    Phrase
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "clause"}
                    enabled={availableCategories.includes("clause")}
                    onClick={() => {
                        onElementClick && onElementClick(AnimationIdBuilderUtils.extendId(categoryIdBase, "clause"));
                        onCategorySelect && onCategorySelect("clause");
                    }}
                >
                    Clause
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "coordinated"}
                    enabled={availableCategories.includes("coordinated")}
                    onClick={() => {
                        onElementClick && onElementClick(AnimationIdBuilderUtils.extendId(categoryIdBase, "coordinated"));
                        onCategorySelect && onCategorySelect("coordinated");
                    }}
                >
                    Coord.
                </Category>
                <Category
                    icon={FaLayerGroup}
                    active={activeCategory === "sentence"}
                    enabled={availableCategories.includes("sentence")}
                    onClick={() => {
                        onElementClick && onElementClick(AnimationIdBuilderUtils.extendId(categoryIdBase, "sentence"));
                        onCategorySelect && onCategorySelect("sentence");
                    }}
                >
                    Sentence
                </Category>
            </div>
            <div className={accessClassName(styles, "items")}>
                {activeItems.map((item) => {
                    const animateId = AnimationIdBuilderUtils.extendId(animateIdBase, "element", item);
                    const data = ElementDisplayInfo.getDisplayInfo(item);
                    const name = ElementDisplayInfo.getAbbreviatedName(data);
                    const header = activeCategory === "coordinated"
                        ? data.header.slice(1)
                        : data.header;
                    return (
                        <Item
                            key={item}
                            header={header}
                            onClick={() => onElementSelect && onElementSelect(item)}
                            animateId={animateId}
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
    animateId?: string;
    children: string;
}

const Category: React.VFC<CategoryProps> = ({ icon, active, enabled, onClick, animateId, children }) => {
    const Icon = icon;
    return (
        <div
            id={animateId}
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
    animateId?: string;
}

const Item: React.VFC<ItemProps> = ({ onClick, selected, header, animateId, children }) => {
    const { activeElement } = useContext(ControlAnimationContext);
    const { onElementClick } = useContext(ClickListenerContext);

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);
    const itemContentClasses = ["itemContent"];
    if (isAnimating) {
        itemContentClasses.push("itemContentAnimate");
    }

    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, ...itemContentClasses)}
                onClick={() => {
                    onElementClick && onElementClick(animateId);
                    onClick && onClick();
                }}
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