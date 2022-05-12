import { accessClassName, DiagramState, DisplayLexeme, ElementDisplayInfo } from "@app/utils";
import { withClassNameProp } from "@app/utils/hoc";
import { ElementCategory, ElementId } from "@domain/language";
import { Model } from "@utils/model";
import React, { useReducer } from "react";
import { FaTimes, FaUndo } from "react-icons/fa";
import { LabelSettings, LabelView, Lexeme } from "../LabelView";
import { NavigateMenu } from "../NavigateMenu";
import styles from "./_styles.module.scss";

export interface ExampleBlockquoteOpenSuccessProps {
    children: Model;
    onExit: () => void;
}

type Action = {
    type: "element select";
    id: ElementId;
} | {
    type: "category select";
    category: ElementCategory;
} | {
    type: "up level";
} | {
    type: "reset";
}

interface State {
    diagram: DiagramState;
    defaultElement?: ElementId;
    defaultCategory?: ElementCategory;
    selectedElement?: ElementId;
    selectedCategory?: ElementCategory;
    allowReset?: boolean;
}

function getUpExpanded(diagram: DiagramState, selectedElement: ElementId | undefined, selectedCategory: ElementCategory | undefined): ElementId | undefined {
    if (selectedElement === undefined) {
        throw "cannot navigate up if no element is expanded";
    }
    const expandedItem = DiagramState.getItem(diagram, selectedElement);
    if (expandedItem.ref === undefined) {
        return undefined;
    }
    const parentItem = DiagramState.getItem(diagram, expandedItem.ref);
    const category = ElementCategory.getDefault(selectedCategory);
    const categoryFilter = ElementCategory.getLayerFilter(category);
    const parentCategory = ElementCategory.getElementCategory(parentItem.type);
    return categoryFilter(parentCategory) ? expandedItem.ref : undefined;
}

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "element select":
            return {
                ...state,
                allowReset: true,
                selectedElement: action.id
            };
        case "category select":
            return {
                ...state,
                allowReset: true,
                selectedCategory: action.category
            };
        case "up level": {
            const { selectedElement, selectedCategory, diagram } = state;
            if (selectedElement === undefined) {
                throw "Cannot go up a level without a selected element";
            }
            const newSelectedElement = getUpExpanded(diagram, selectedElement, selectedCategory);
            return {
                ...state,
                selectedElement: newSelectedElement
            };
        }
        case "reset": {
            const { defaultElement, defaultCategory } = state;
            const output: State = {
                ...state,
                selectedElement: defaultElement,
                selectedCategory: defaultCategory
            };
            delete output.allowReset;
            return output;
        }
    }
}

function initializer({ defaultElement, defaultCategory, diagram }: Model): State {
    return {
        selectedElement: defaultElement,
        selectedCategory: defaultCategory,
        defaultElement,
        defaultCategory,
        diagram
    };
}

interface DisplayData {
    lexemes: Lexeme[];
    labelSettings: Record<ElementId, LabelSettings>;
}

function getDisplayData(diagram: DiagramState, category?: ElementCategory, selectedElement?: ElementId): DisplayData {
    const lexemes = DisplayLexeme.getDisplayLexemes(diagram, category, selectedElement);
    const labelSettings = getLabelSettings(diagram, lexemes);
    return { lexemes, labelSettings };
}

function getLabelSettings(diagram: DiagramState, lexemes: Lexeme[]): Record<ElementId, LabelSettings> {
    const output: Record<ElementId, LabelSettings> = {};
    for (let index = 0; index < lexemes.length; index++) {
        const lexeme = lexemes[index];
        if (lexeme.type === "whitespace") {
            continue;
        }
        const { id } = lexeme;
        const { type } = DiagramState.getItem(diagram, id);
        if (type !== "word") {
            const displayInfo = ElementDisplayInfo.getDisplayInfo(type);
            output[id] = {
                color: displayInfo.color,
                header: displayInfo.header
            };
        }
    }
    return output;
}

export const ExampleBlockquoteOpenSuccess: React.VFC<ExampleBlockquoteOpenSuccessProps> = ({ children, onExit }) => {
    const [state, dispatch] = useReducer(reducer, children, initializer);
    const { selectedElement, selectedCategory, defaultElement, defaultCategory } = state;
    const allowReset = selectedElement !== defaultElement || selectedCategory !== defaultCategory;
    const { diagram } = children;
    const { lexemes, labelSettings } = getDisplayData(diagram, selectedCategory, selectedElement);
    const resetClasses = [
        "resetButton",
        allowReset ? "resetButtonEnabled" : "resetButtonDisabled"
    ];
    return (
        <blockquote className={accessClassName(styles, "exampleBlockquote")}>
            <div className={accessClassName(styles, "labelViewContainer")}>
                <ExtendedLabelView
                    className={accessClassName(styles, "labelView")}
                    onLabelClick={(id) => dispatch({ type: "element select", id })}
                    settings={labelSettings}
                >
                    {lexemes}
                </ExtendedLabelView>
                <div className={accessClassName(styles, "buttonContainer")}>
                    <FaTimes onClick={onExit}/>
                </div>
            </div>
            <div className={accessClassName(styles, "navMenuContainer")}>
                <div className={accessClassName(styles, ...resetClasses)}>
                    <FaUndo onClick={() => dispatch({ type: "reset" })}/>
                    Reset
                </div>
                <ExtendedNavigateMenu
                    className={accessClassName(styles, "navMenu")}
                    category={selectedCategory}
                    onCategoryChange={(category) => dispatch({ type: "category select", category })}
                    enableUpLevel={selectedElement !== undefined}
                    onUpLevel={() => dispatch({ type: "up level" })}
                >

                </ExtendedNavigateMenu>
            </div>
        </blockquote>
    );
};

const ExtendedLabelView = withClassNameProp(LabelView);
const ExtendedNavigateMenu = withClassNameProp(NavigateMenu);