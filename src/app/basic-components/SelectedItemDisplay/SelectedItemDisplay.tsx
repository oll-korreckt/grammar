import { accessClassName, ElementDisplayInfo, ElementSelectNode, HeadElementSelectNode, TailElementSelectNode, WordViewContext } from "@app/utils";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";
import React, { useContext } from "react";
import { FaTimesCircle } from "react-icons/fa";
import styles from "./_styles.scss";

export interface SelectedItemDisplayProps {
    onItemSelect?: (item: HeadElementSelectNode | TailElementSelectNode) => void;
    onClear?: () => void;
}

function getPropertyName({ properties }: ElementDisplayInfo, propValues: [string] | [string, string]): string {
    let output = "";
    [...propValues].sort((a, b) => {
        const aOrder = properties[a].displayOrder;
        const bOrder = properties[b].displayOrder;
        return aOrder - bOrder;
    }).forEach((propValue, index) => {
        const propInfo = properties[propValue];
        const abrName = ElementDisplayInfo.getAbbreviatedName(propInfo);
        if (index > 0) {
            output += " | ";
        }
        output += abrName;
    });
    return output;
}

function getHeadItemText(item: HeadElementSelectNode): string {
    return ElementDisplayInfo.getAbbreviatedName(ElementDisplayInfo.getDisplayInfo(item.type));
}

function getTailItemText(prev: ElementSelectNode, item: TailElementSelectNode): string {
    const prevInfo = ElementDisplayInfo.getDisplayInfo(prev.type);
    const itemInfo = ElementDisplayInfo.getDisplayInfo(item.type);
    const propName = getPropertyName(prevInfo, item.property);
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

export const SelectedItemDisplay: React.VFC<SelectedItemDisplayProps> = ({ onItemSelect, onClear }) => {
    const { selectedItem } = useContext(WordViewContext);
    return (
        <div className={accessClassName(styles, "selectedItemDisplay")}>
            <div className={accessClassName(styles, "displayItems")}>
                {selectedItem && selectedItem.map((item, index) => {
                    const text = index === 0
                        ? getHeadItemText(item)
                        : getTailItemText(
                            selectedItem[index - 1],
                            item as TailElementSelectNode
                        );
                    let Button = makeRefComponent<HTMLDivElement>("SelectedItemDisplayButton", (_, ref) => {
                        return (
                            <div
                                className={accessClassName(styles, "button")}
                                ref={ref}
                                onClick={() => onItemSelect && onItemSelect(item)}
                            >
                                {text}
                            </div>
                        );
                    });
                    if (index < selectedItem.length - 1) {
                        Button = withArrow(Button);
                    }
                    return <Button key={item.id}/>;
                })}
            </div>
            <div className={accessClassName(styles, "cancelButton")}>
                <FaTimesCircle onClick={() => onClear && onClear()}/>
            </div>
        </div>
    );
};
