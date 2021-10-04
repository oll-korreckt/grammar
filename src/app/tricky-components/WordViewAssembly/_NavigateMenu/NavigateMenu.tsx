import { accessClassName, DiagramState } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementCategory, ElementId } from "@domain/language";
import React from "react";
import { IconType } from "react-icons";
import { FaArrowLeft, FaLayerGroup } from "react-icons/fa";
import { Action, NavigateState } from "../_utils/types";
import styles from "./_styles.scss";

export interface NavigateMenuProps {
    state: NavigateState;
    dispatch: React.Dispatch<Action>;
}

export const NavigateMenu = withClassNameProp(makeRefComponent<HTMLDivElement, NavigateMenuProps>("NavigateMenu", ({ state, dispatch }, ref) => {
    const diagramState = state.diagramStateContext.state;
    const { elementCategory, selectedElement } = state.wordViewContext;

    return (
        <div className={accessClassName(styles, "navigateMenu")} ref={ref}>
            <div className={accessClassName(styles, "upLevelSection")}>
                <UpLevel
                    state={diagramState}
                    category={state.wordViewContext.elementCategory}
                    dispatch={dispatch}
                    selectedElement={selectedElement}
                />
            </div>
            <CategorySelector
                category={elementCategory}
                onCategorySelect={(cat) => dispatch({ type: "navigate: elementCategory", elementCategory: cat })}
            />
        </div>
    );
}));

interface UpLevelProps {
    state: DiagramState;
    category: ElementCategory;
    dispatch: React.Dispatch<Action>;
    selectedElement?: ElementId;
}

interface UpLevelData {
    canNavigate: boolean;
    target?: ElementId;
}

function getUpLevelData(state: DiagramState, category: ElementCategory, selectedElement: ElementId | undefined): UpLevelData {
    if (selectedElement === undefined) {
        return { canNavigate: false };
    }
    const parentItem = DiagramState.getItem(state, selectedElement);
    if (parentItem.ref === undefined) {
        return { canNavigate: true };
    }
    const targetItem = DiagramState.getItem(state, parentItem.ref);
    const targetCategory = ElementCategory.getElementCategory(targetItem.type);
    const filterFn = ElementCategory.getLayerFilter(category);
    const output: UpLevelData = { canNavigate: true };
    if (filterFn(targetCategory)) {
        output.target = parentItem.ref;
    }
    return output;
}

const UpLevel: React.VFC<UpLevelProps> = ({ state, category, dispatch, selectedElement }) => {
    const { canNavigate, target } = getUpLevelData(state, category, selectedElement);
    const classNames = canNavigate
        ? ["enableState", "activeColor"]
        : ["disableState", "inactiveColor"];

    return (
        <ExtendedLabeledIcon
            icon={FaArrowLeft}
            className={accessClassName(styles, ...classNames)}
            onClick={() => dispatch({ type: "navigate: selectedItem", selectedElement: target })}
        >
            Up Level
        </ExtendedLabeledIcon>
    );
};

export interface CategorySelectorProps {
    onCategorySelect?: (category: ElementCategory) => void;
    category: ElementCategory;
}

interface ButtonData {
    icon: IconType;
    category: ElementCategory;
    text: string;
}

export const CategorySelector = makeRefComponent<HTMLDivElement, CategorySelectorProps>("ElementCategorySelector", ({ onCategorySelect, ...rest }, ref) => {
    const elementCategory = rest.category;
    const data: ButtonData[] = [
        { icon: FaLayerGroup, category: "word", text: "Word" },
        { icon: FaLayerGroup, category: "partOfSpeech", text: "Category" },
        { icon: FaLayerGroup, category: "phrase", text: "Phrase" },
        { icon: FaLayerGroup, category: "clause", text: "Clause" }
    ];

    return (
        <div
            className={accessClassName(styles, "categorySelector")}
            ref={ref}
        >
            {data.map(({ icon, category, text }) => {
                const classNames = category === elementCategory
                    ? ["activeColor", "disableState"]
                    : ["inactiveColor", "enableState"];
                const onClick = () => onCategorySelect && onCategorySelect(category);
                return (
                    <ExtendedLabeledIcon
                        key={category}
                        icon={icon}
                        onClick={onClick}
                        className={accessClassName(styles, ...classNames)}
                    >
                        {text}
                    </ExtendedLabeledIcon>
                );
            })}
        </div>
    );
});

interface LabeledIconProps {
    icon: IconType;
    children: string;
}

const LabeledIcon = makeRefComponent<HTMLDivElement, LabeledIconProps>("LabeledIcon", ({ icon, children }, ref) => {
    const Icon = icon;
    return (
        <div className={accessClassName(styles, "labeledIcon")} ref={ref}>
            <div className={accessClassName(styles, "labeledIconBody")}>
                <Icon className={accessClassName(styles, "icon")}/>
                <div className={accessClassName(styles, "label")}>
                    {children}
                </div>
            </div>
        </div>
    );
});

const ExtendedLabeledIcon = withEventProp(
    withClassNameProp(LabeledIcon),
    "click"
);