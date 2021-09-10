import { accessClassName, DiagramState, DiagramStateContext, DisplayModel, SelectNode, WordRange, WordViewContext } from "@app/utils";
import { ElementId } from "@domain/language";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./_styles.scss";

export interface SelectedItemParentProps {
    onUpLevel?: (parent: SelectNode) => void;
}

function getParentText(state: DiagramState, model: DisplayModel, id: ElementId): string {
    let output = "";
    const dispElement = model[id];
    console.log(id);
    dispElement.words.forEach((wIndex, index) => {
        if (index > 0) {
            output += " ... ";
        }
        const lexemes = (Array.isArray(wIndex) ? WordRange.expand(wIndex) : [wIndex])
            .map((i) => {
                const wId = state.wordOrder[i];
                return DiagramState.getTypedItem(state, "word", wId).value.lexeme;
            });
        lexemes.forEach((lexeme, lexIndex) => {
            if (lexIndex > 0) {
                output += " ";
            }
            output += lexeme;
        });
    });
    return output;
}

export const SelectedItemParent: React.VFC<SelectedItemParentProps> = ({ onUpLevel }) => {
    const { state, model } = React.useContext(DiagramStateContext);
    const { selectedNode } = React.useContext(WordViewContext);
    const parent = selectedNode === undefined
        ? undefined
        : SelectNode.getParent(state, selectedNode.id);
    return (
        <div className={accessClassName(styles, "parent")}>
            {parent &&
                <>
                    <FaArrowLeft
                        onClick={() => onUpLevel && onUpLevel(parent as SelectNode)}
                        className={accessClassName(styles, "back")}
                    />
                    <div className={accessClassName(styles, "parentText")}>
                        {getParentText(state, model, parent.id)}
                    </div>
                </>
            }
        </div>
    );
};