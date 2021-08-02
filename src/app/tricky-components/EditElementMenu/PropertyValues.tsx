import { PropertyValueItem } from "@app/basic-components/PropertyValueItem";
import { accessClassName, DiagramState, DiagramStateContext, ElementDisplayInfo } from "@app/utils";
import { makeRefComponent, RefComponent, withOnClick } from "@app/utils/hoc";
import { ElementId, ElementReference } from "@domain/language";
import React, { useContext } from "react";
import { MenuItemContext } from "./menu-item-context";
import styles from "./_styles.scss";

export const PropertyValues: React.VFC = () => {
    const menuItemContext = useContext(MenuItemContext);
    const refs: ElementReference[] = menuItemContext.reference === undefined
        ? [] : Array.isArray(menuItemContext.reference)
            ? menuItemContext.reference : [menuItemContext.reference];

    return (
        <div className={accessClassName(styles, "propertyValues")}>
            {refs.map(({ id }) => {
                let Component = makePropertyValueItem(id);
                Component = withOnClick(Component, () => menuItemContext.deleteReference(id));
                return <Component key={id}/>;
            })}
        </div>
    );
};

function reduceWords(words: string[]): string {
    let output = words[0];
    for (let index = 1; index < words.length; index++) {
        const word = words[index];
        output += ` ${word}`;
    }
    return output;
}

function makePropertyValueItem(id: ElementId): RefComponent<HTMLDivElement> {
    const displayName = PropertyValueItem.displayName;
    if (displayName === undefined) {
        throw "Cannot have component w/o displayName property set";
    }
    return makeRefComponent<HTMLDivElement>(displayName, (_, ref) => {
        const diagramState = useContext(DiagramStateContext);
        const displayElement = diagramState.model.elements[id];
        if (displayElement === undefined) {
            throw `Element '${id}' not found`;
        }
        const type = DiagramState.getItem(diagramState.state.currState, id).type;
        const words = displayElement.words.sort().map((wIndex) => {
            const wId = diagramState.state.currState.wordOrder[wIndex];
            const lexeme = DiagramState.getTypedItem(diagramState.state.currState, "word", wId).value.lexeme;
            return lexeme;
        });
        const reducedWords = reduceWords(words);
        const { header, color } = ElementDisplayInfo.getDisplayInfo(type);
        return (
            <PropertyValueItem ref={ref} type={header} color={color}>
                {reducedWords}
            </PropertyValueItem>
        );
    });
}