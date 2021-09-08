import { accessClassName, DiagramState, DiagramStateContext, DisplayModel, HeadElementSelectNode, TailElementSelectNode, WordRange, WordViewContext } from "@app/utils";
import { ElementId } from "@domain/language";
import React from "react";
import { FaArrowLeft } from "react-icons/fa";
import styles from "./_styles.scss";

export interface SelectedItemParentProps {
    onUpLevel?: (parent: HeadElementSelectNode | TailElementSelectNode) => void;
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
    const { selectedItem } = React.useContext(WordViewContext);
    let parent: HeadElementSelectNode | TailElementSelectNode | undefined = undefined;
    if (selectedItem !== undefined) {
        for (let index = selectedItem.length - 1; index >= 0; index--) {
            const element = selectedItem[index];
            if (element.state === "expand") {
                parent = element;
                break;
            }
        }
    }
    return (
        <div className={accessClassName(styles, "parent")}>
            {parent &&
                <>
                    <FaArrowLeft
                        onClick={() => onUpLevel && onUpLevel(parent as HeadElementSelectNode | TailElementSelectNode)}
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