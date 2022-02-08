import React from "react";
import { accessClassName, useOutsideClick } from "@app/utils";
import styles from "./_styles.module.scss";

export interface ContextMenuProps {
    children: [string, ...string[]];
    onItemSelect?: (item: string) => void;
    onCancel?: () => void;
}

function isUnique(items: string[]): boolean {
    const set = new Set(items);
    return set.size === items.length;
}

export const ContextMenu: React.VFC<ContextMenuProps> = ({ children, onItemSelect, onCancel }) => {
    if (!isUnique(children)) {
        throw "Items must be unique";
    }
    const ref = useOutsideClick<HTMLDivElement>(() => onCancel && onCancel());
    return (
        <div ref={ref} className={accessClassName(styles, "contextMenu")}>
            {children.map((child) => {
                return (
                    <div
                        className={accessClassName(styles, "item")}
                        onClick={() => onItemSelect && onItemSelect(child)}
                        key={child}
                    >
                        <div>{child}</div>
                    </div>
                );
            })}
        </div>
    );
};