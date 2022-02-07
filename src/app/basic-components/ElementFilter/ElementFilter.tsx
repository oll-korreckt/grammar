import { accessClassName, ElementFilterType } from "@app/utils";
import { useOutsideClick } from "@app/utils/hooks";
import React, { ReactNode, useReducer } from "react";
import { FaFilter } from "react-icons/fa";
import styles from "./_styles.modules.scss";

const ELEMENT_FILTER_ITEMS: [ElementFilterType, React.VFC<ElementFilterItemProps>][] = [
    createElementFilterItem("word", "Word"),
    createElementFilterItem("partOfSpeech", "Part of Speech"),
    createElementFilterItem("phrase", "Phrase"),
    createElementFilterItem("clause", "Clause"),
    createElementFilterItem("sentence", "Sentence")
];

interface ElementFilterItemProps {
    onClick: (value: ElementFilterType) => void;
    selected: boolean;
}

function createElementFilterItem(type: ElementFilterType, children: ReactNode): [ElementFilterType, React.VFC<ElementFilterItemProps>] {
    const component: React.VFC<ElementFilterItemProps> = ({ onClick, selected }) => {
        let classNames: string[] = ["item"];
        if (selected) {
            classNames = [...classNames, "selected"];
        }
        const className = accessClassName(styles, ...classNames);
        return (
            <div onClick={() => onClick(type)} className={className}>
                {children}
            </div>
        );
    };
    component.displayName = "ElementFilterItem";
    return [type, component];
}

export interface ElementFilterProps {
    onSelectChange?: (filterState?: ElementFilterType) => void;
    initialState?: ElementFilterType;
}

interface State {
    display: "open" | "closed";
    selected?: ElementFilterType;
}

type Action = {
    type: "displayToggle";
} | {
    type: "selectedToggle";
    value: ElementFilterType;
}

function init(selected?: ElementFilterType): State {
    return {
        display: "closed",
        selected: selected
    };
}

function displayToggle(display: State["display"]): State["display"] {
    switch (display) {
        case "open":
            return "closed";
        case "closed":
            return "open";
        default:
            throw `Unhandled state '${display}'`;
    }
}

function selectedToggle(currentValue: ElementFilterType | undefined, selectedValue: ElementFilterType): ElementFilterType | undefined {
    if (currentValue === undefined) {
        return selectedValue;
    }
    return currentValue === selectedValue ? undefined : selectedValue;
}

function reducer(state: State, action: Action): State {
    const actionType = action.type;
    switch (action.type) {
        case "displayToggle":
            return { ...state, display: displayToggle(state.display) };
        case "selectedToggle":
            return { ...state, selected: selectedToggle(state.selected, action.value) };
        default:
            throw `Unhandled action type '${actionType}'`;
    }
}

export const ElementFilter: React.VFC<ElementFilterProps> = (props) => {
    const [state, dispatch] = useReducer(reducer, props.initialState, init);
    const ref = useOutsideClick<HTMLDivElement>(() => state.display === "open" && dispatch({ type: "displayToggle" }));
    return (
        <div className={accessClassName(styles, "elementFilter")} ref={ref}>
            <div onClick={() => dispatch({ type: "displayToggle" })} className={accessClassName(styles, "display")}>
                <div className={accessClassName(styles, "icon", state.selected !== undefined ? "iconActive" : "iconInactive")}>
                    <FaFilter />
                </div>
                <div>Filter</div>
            </div>
            {state.display === "open" &&
                <div className={accessClassName(styles, "itemContainer")}>
                    {ELEMENT_FILTER_ITEMS.map(([type, Item]) => {
                        return (
                            <Item
                                key={type}
                                selected={type === state.selected}
                                onClick={(value) => dispatch({ type: "selectedToggle", value: value })}
                            />
                        );
                    })}
                </div>
            }
        </div>
    );
};