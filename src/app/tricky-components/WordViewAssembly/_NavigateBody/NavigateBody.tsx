import { ElementCategorySelector } from "@app/basic-components/ElementCategorySelector";
import { withFade } from "@app/basic-components/Word";
import { BuildFunction, WordView } from "@app/tricky-components";
import { accessClassName, DiagramState } from "@app/utils";
import { withEventListener } from "@app/utils/hoc";
import { ElementCategory, ElementId } from "@domain/language";
import React from "react";
import { Action, NavigateState } from "../_utils/types";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./_styles.scss";

export interface NavigateBodyProps {
    state: NavigateState;
    dispatch: React.Dispatch<Action>;
}

function createTemplateBuildFn(dispatch: React.Dispatch<Action>): BuildFunction {
    return (Component, data) => {
        return data.type === "word"
            ? withFade(Component)
            : withEventListener(Component, "click", () => dispatch({
                type: "navigate: selectedItem",
                selectedElement: data.id
            }));
    };
}

export const NavigateBody: React.VFC<NavigateBodyProps> = ({ state, dispatch }) => {
    const buildFn = createTemplateBuildFn(dispatch);
    const diagramState = state.diagramStateContext.state;
    const { elementCategory, selectedElement } = state.wordViewContext;

    return (
        <>
            <div className={accessClassName(styles, "overlay")}>
                <ParentUpLevel
                    state={diagramState}
                    category={state.wordViewContext.elementCategory}
                    dispatch={dispatch}
                    selectedElement={selectedElement}
                />
                <ElementCategorySelector
                    category={elementCategory}
                    onCategorySelect={(cat) => dispatch({ type: "navigate: elementCategory", elementCategory: cat })}
                />
            </div>
            <WordView buildFn={buildFn}/>
        </>
    );
};

interface ParentUpLevelProps {
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

const ParentUpLevel: React.VFC<ParentUpLevelProps> = ({ state, category, dispatch, selectedElement }) => {
    const { canNavigate, target } = getUpLevelData(state, category, selectedElement);
    const classNames: string[] = [];
    if (canNavigate) {
        classNames.push("upLevel");
    } else {
        classNames.push("disable");
    }

    return (
        <div
            className={accessClassName(styles, ...classNames)}
            onClick = {() => dispatch({ type: "navigate: selectedItem", selectedElement: target })}
        >
            <div>
                <FaArrowLeft/>
            </div>
            <div>
                Up Level
            </div>
        </div>

    );
};