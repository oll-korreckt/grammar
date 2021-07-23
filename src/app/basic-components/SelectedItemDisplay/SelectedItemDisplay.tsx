import { accessClassName, DisplayModelContext, ElementSelectNode, SelectedElement, withOnClick } from "@app/utils";
import React from "react";
import { useContext } from "react";
import { SelectedItemDisplayButton } from "./SelectedItemDisplayButton";
import styles from "./_styles.scss";

type HeadItemClick = () => void;
type ItemClick = (index: number) => void;

function getItemText({ type, property }: ElementSelectNode): string {
    return property === undefined ? type : `${property} (${type})`;
}

function getItems(selectedItem: SelectedElement, headItemClick: HeadItemClick, itemClick: ItemClick): React.ReactElement[] {
    if (selectedItem.length === 1) {
        const node = selectedItem[0];
        const text = getItemText(node);
        const Button = withOnClick(SelectedItemDisplayButton, headItemClick);
        return [<Button key={0} showX={true}>{text}</Button>];
    } else {
        let index = 0;
        const output: React.ReactElement[] = [];
        selectedItem.forEach((node, itemNumber) => {
            if (index > 0) {
                output.push((
                    <div key={index} className={accessClassName(styles, "arrow")}>
                        <span>{">"}</span>
                    </div>
                ));
                index++;
            }
            const text = getItemText(node);
            const Button = withOnClick(SelectedItemDisplayButton, () => itemClick(itemNumber));
            output.push(<Button key={index}>{text}</Button>);
            index++;
        });
        return output;
    }
}

const errMsg = "current selectedItem should not be undefined";

export const SelectedItemDisplay: React.VFC = () => {
    const display = useContext(DisplayModelContext);
    if (display.selectedItem === undefined) {
        throw errMsg;
    }

    function itemClick(index: number) {
        if (display.selectedItem !== undefined && index === display.selectedItem.length - 1) {
            return;
        }
        display.setSelectedItem((curr) => {
            if (curr === undefined) {
                throw errMsg;
            }
            return curr.filter((_, i) => i <= index) as SelectedElement;
        });
    }
    const items = getItems(display.selectedItem, () => display.setSelectedItem(undefined), itemClick);
    return (
        <div className={accessClassName(styles, "selectedItemDisplay")}>
            {items}
        </div>
    );
};