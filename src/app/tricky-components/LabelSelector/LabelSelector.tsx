import { accessClassName, ElementDisplayInfo, WordViewContext } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useContext } from "react";
import { FaLink, FaLayerGroup } from "react-icons/fa";
import { IconType } from "react-icons/lib";
import { AvailableTypes, DeriveData } from "./available-types";
import { LabelCategory, LabelSelectorAction, LabelSelectorState } from "./hooks";
import styles from "./_styles.scss";


type CategoryButtonData = {
    category: LabelCategory;
    text: string;
    icon: IconType;
}

export interface LabelSelectorProps {
    state?: LabelSelectorState;
    dispatch?: React.Dispatch<LabelSelectorAction>;
}

export const LabelSelector: React.VFC<LabelSelectorProps> = ({ state, dispatch }) => {
    const context = useContext(WordViewContext);
    const availableTypes = AvailableTypes.getAvailableTypes(context.visibleElements);
    const useableState: LabelSelectorState = state !== undefined ? state : {};
    const useableDispatch: React.Dispatch<LabelSelectorAction> = (action) => dispatch && dispatch(action);

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

    const deriveData: DeriveData[] = useableState.selectedCategory !== undefined && availableTypes[useableState.selectedCategory] !== undefined
        ? availableTypes[useableState.selectedCategory] as DeriveData[]
        : [];

    return (
        <div className={accessClassName(styles, "labelSelector")}>
            <div className={accessClassName(styles, "categorySelector")}>
                {categoryData.map((item) => {
                    const className = item.category === useableState.selectedCategory
                        ? "selectedCategoryItem"
                        : availableTypes[item.category] !== undefined
                            ? "enabledCategoryItem"
                            : "disabledCategoryItem";
                    return (
                        <ExtendedCategorySelectorItem
                            key={item.category}
                            icon={item.icon}
                            className={accessClassName(styles, className)}
                            onClick={() => useableDispatch({ type: "selectedCategory", selectedCategory: item.category })}
                        >
                            {item.text}
                        </ExtendedCategorySelectorItem>
                    );
                })}
            </div>
            <div className={accessClassName(styles, "elementSelector")}>
                {deriveData.map((data) => {
                    // const classNames: string[] = [];
                    const className = data.type === useableState.selectedType
                        ? "selectedElementItem"
                        : "unselectedElementItem";
                    return (
                        <ExtendedElementItem
                            key={data.baseType}
                            className={accessClassName(styles, className)}
                            onClick={() => useableDispatch({ type: "selectedType", selectedType: data.type })}
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