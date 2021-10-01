import { accessClassName, ElementDisplayInfo, WordViewContext } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { FaLink, FaLayerGroup } from "react-icons/fa";
import { IconType } from "react-icons/lib";
import { AvailableTypes, DeriveData, LabelCategory } from "./available-types";
import styles from "./_styles.scss";
import { CSSTransition } from "react-transition-group";

type CategoryButtonData = {
    category: LabelCategory;
    text: string;
    icon: IconType;
}

export interface LabelSelectorProps {
    elementType?: Exclude<ElementType, "word">;
    onElementTypeSelect?: (elementType: Exclude<ElementType, "word">) => void;
    onAddClick?: () => void;
}

export const LabelSelector: React.VFC<LabelSelectorProps> = ({ elementType, onElementTypeSelect, onAddClick }) => {
    const context = useContext(WordViewContext);
    const [selectedCategory, setSelectedCategory] = useState<LabelCategory | undefined>();
    const availableTypes = useMemo(() => {
        return AvailableTypes.getAvailableTypes(context.visibleElements);
    }, [context.visibleElements]);
    const [initialCategory, containingCategory] = useMemo(() => {
        return AvailableTypes.getSelectedCategory(availableTypes, elementType);
    }, [availableTypes, elementType]);

    useEffect(() => {
        setSelectedCategory(initialCategory);
    }, [initialCategory]);

    function getCategorySelectorClass(selectorCategory: LabelCategory): string[] {
        const output: string[] = [];
        if (selectorCategory === selectedCategory) {
            output.push("selectedCategoryItem");
        } else if (availableTypes[selectorCategory] !== undefined) {
            output.push("enabledCategoryItem");
        } else {
            output.push("disabledCategoryItem");
        }

        if (selectorCategory === containingCategory) {
            output.push("containingCategoryItem");
        }
        return output;
    }

    const categoryData: CategoryButtonData[] = [
        {
            category: "partOfSpeech",
            icon: FaLayerGroup,
            text: "Category"
        },
        {
            category: "phrase",
            icon: FaLayerGroup,
            text: "Phrase"
        },
        {
            category: "clause",
            icon: FaLayerGroup,
            text: "Clause"
        },
        {
            category: "coordinated",
            icon: FaLink,
            text: "Coordinated"
        }
    ];

    const deriveData: DeriveData[] = selectedCategory !== undefined && availableTypes[selectedCategory] !== undefined
        ? availableTypes[selectedCategory] as DeriveData[]
        : [];

    return (
        <div className={accessClassName(styles, "labelSelector")}>
            <div className={accessClassName(styles, "categorySelector")}>
                {categoryData.map((item) => {
                    const classNames = getCategorySelectorClass(item.category);
                    return (
                        <ExtendedCategorySelectorItem
                            key={item.category}
                            icon={item.icon}
                            className={accessClassName(styles, ...classNames)}
                            onClick={() => setSelectedCategory(item.category)}
                        >
                            {item.text}
                        </ExtendedCategorySelectorItem>
                    );
                })}
            </div>
            <div className={accessClassName(styles, "elementSelectorContainer")}>
                <div className={accessClassName(styles, "elementSelector")}>
                    {deriveData.map((data) => {
                        const selected = data.type === elementType;
                        const onClick: () => void = selected
                            ? () => onAddClick && onAddClick()
                            : () => onElementTypeSelect && onElementTypeSelect(data.type);

                        return (
                            <ExtendedElementItem
                                key={data.baseType}
                                className={accessClassName(styles, "unselectedElementItem")}
                                onClick={onClick}
                                selected={selected}
                            >
                                {data.baseType}
                            </ExtendedElementItem>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface CategorySelectorItemProps {
    icon: IconType;
    children: string;
}

const CategorySelectorItem = makeRefComponent<HTMLDivElement, CategorySelectorItemProps>("LabelSelectorItem", ({ children, icon }, ref) => {
    const Icon = icon;
    return (
        <div className={accessClassName(styles, "categoryItem")} ref={ref}>
            <div className={accessClassName(styles, "categoryItemIcon")}>
                <Icon/>
            </div>
            <div className={accessClassName(styles, "categoryItemText")}>
                {children}
            </div>
        </div>
    );
});

const ExtendedCategorySelectorItem = withEventProp(withClassNameProp(CategorySelectorItem), "click");

interface ElementItemProps {
    children: ElementType;
    selected?: boolean | undefined;
}

const ElementItem = makeRefComponent<HTMLDivElement, ElementItemProps>("ElementItem", ({ children, selected }, ref) => {
    const displayInfo = ElementDisplayInfo.getDisplayInfo(children);
    const abrName = ElementDisplayInfo.getAbbreviatedName(displayInfo).split(" ")[0].replaceAll(".", "");

    return (
        <div
            className={accessClassName(styles, "elementItem")}
            ref={ref}
        >
            <div className={accessClassName(styles, "elementItemHeader")}>
                {displayInfo.header}
            </div>
            <div className={accessClassName(styles, "elementItemText")}>
                {abrName}
            </div>
            <CSSTransition
                in={selected}
                timeout={400}
                classNames={{
                    enter: accessClassName(styles, "addEnter"),
                    enterActive: accessClassName(styles, "addEnterActive"),
                    exit: accessClassName(styles, "addExit")
                }}
                unmountOnExit
            >
                <div className={accessClassName(styles, "add")}>
                    Add
                </div>
            </CSSTransition>
        </div>
    );
});

const ExtendedElementItem = withEventProp(withClassNameProp(ElementItem), "click");