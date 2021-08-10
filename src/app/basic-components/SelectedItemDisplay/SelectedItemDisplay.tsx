import { accessClassName, ElementDisplayInfo, ElementSelectNode, HeadElementSelectNode, TailElementSelectNode } from "@app/utils";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";
import React, { useContext } from "react";
import { FaTimesCircle } from "react-icons/fa";
import { SelectedItemDisplayContext } from "./selected-item-display-context";
import styles from "./_styles.scss";

function getHeadItemText(item: HeadElementSelectNode): string {
    return ElementDisplayInfo.getAbbreviatedName(ElementDisplayInfo.getDisplayInfo(item.type));
}

function getTailItemText(prev: ElementSelectNode, item: TailElementSelectNode): string {
    const prevInfo = ElementDisplayInfo.getDisplayInfo(prev.type);
    const itemInfo = ElementDisplayInfo.getDisplayInfo(item.type);
    const propName = ElementDisplayInfo.getAbbreviatedName(prevInfo.properties[item.property]);
    const itemType = itemInfo.header;
    return `${propName} (${itemType})`;
}

function withArrow(Component: RefComponent<HTMLDivElement>): RefComponent<HTMLDivElement> {
    return makeRefComponent<HTMLDivElement>("withArrow", (_, ref) => {
        return (
            <>
                <Component ref={ref}/>
                <span className={accessClassName(styles, "arrow")}>{">"}</span>
            </>
        );
    });
}

const errMsg = "current selectedItem should not be undefined";

export const SelectedItemDisplay = makeRefComponent<HTMLDivElement>("SelectedItemDisplay", (_0, ref0) => {
    const context = useContext(SelectedItemDisplayContext);
    if (context.selectedItem === undefined) {
        throw errMsg;
    }
    const items = context.selectedItem;
    return (
        <div className={accessClassName(styles, "selectedItemDisplay")} ref={ref0}>
            <div className={accessClassName(styles, "displayItems")}>
                {items.map((item, index) => {
                    const text = index === 0
                        ? getHeadItemText(item)
                        : getTailItemText(
                            items[index - 1],
                            item as TailElementSelectNode
                        );
                    let Button = makeRefComponent<HTMLDivElement>("SelectedItemDisplayButton", (_1, ref1) => {
                        return (
                            <div
                                className={accessClassName(styles, "button")}
                                ref={ref1}
                            >
                                {text}
                            </div>
                        );
                    });
                    if (context.buildFn) {
                        Button = context.buildFn(Button, item);
                    }
                    if (index < items.length - 1) {
                        Button = withArrow(Button);
                    }
                    return <Button key={item.id}/>;
                })}
            </div>
            <div className={accessClassName(styles, "cancelButton")}>
                <FaTimesCircle onClick={() => context.onClear && context.onClear()}/>
            </div>
        </div>
    );
});
