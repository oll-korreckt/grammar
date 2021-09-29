import { accessClassName, ElementDisplayInfo, WordViewContext } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { FaLink, FaLayerGroup } from "react-icons/fa";
import { IconType } from "react-icons/lib";
import { AvailableTypes, DeriveData, LabelCategory } from "./available-types";
import styles from "./_styles.scss";


type CategoryButtonData = {
    category: LabelCategory;
    text: string;
    icon: IconType;
}

export interface LabelSelectorProps {
    elementType?: Exclude<ElementType, "word">;
    onElementTypeSelect?: (elementType: Exclude<ElementType, "word">) => void;
}

export const LabelSelector: React.VFC<LabelSelectorProps> = ({ elementType, onElementTypeSelect }) => {
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
            text: "Part of Speech"
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
            <div className={accessClassName(styles, "elementSelector")}>
                {deriveData.map((data) => {
                    const className = data.type === elementType
                        ? "selectedElementItem"
                        : "unselectedElementItem";
                    return (
                        <ExtendedElementItem
                            key={data.baseType}
                            className={accessClassName(styles, className)}
                            onClick={() => onElementTypeSelect && onElementTypeSelect(data.type)}
                        >
                            {data.baseType}
                        </ExtendedElementItem>
                    );
                })}
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
        <div ref={ref}>
            <div>
                <Icon/>
            </div>
            <div>
                {children}
            </div>
        </div>
    );
});

const ExtendedCategorySelectorItem = withEventProp(withClassNameProp(CategorySelectorItem), "click");

interface ElementItemProps {
    children: ElementType;
}

const ElementItem = makeRefComponent<HTMLDivElement, ElementItemProps>("ElementItem", ({ children }, ref) => {
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
        </div>
    );
});

const ExtendedElementItem = withEventProp(withClassNameProp(ElementItem), "click");