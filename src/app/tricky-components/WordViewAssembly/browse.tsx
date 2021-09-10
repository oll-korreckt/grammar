import { ContextMenu } from "@app/basic-components/ContextMenu";
import { ElementData } from "@app/utils";
import { withContextMenu } from "@app/utils/hoc";
import React, { Dispatch } from "react";
import { BuildFunction } from "../WordView";
import { createTemplateBuildFn } from "./template";
import { Action, BrowseState } from "./types";

type ContextMenuItems = ["Expand", "Edit", "Derive"];
type ContextMenuItemType = ContextMenuItems[number];

function contextMenuItemSelect(dispatch: Dispatch<Action>, data: ElementData, item: ContextMenuItemType): void {
    switch (item) {
        case "Expand":
            dispatch({
                type: "wordViewContext: selectedItem",
                selectedNode: {
                    id: data.id,
                    type: data.type,
                    state: "expand"
                }
            });
            break;
        case "Edit":
            dispatch({
                type: "edit: Enter",
                id: data.id
            });
            break;
        case "Derive":
            dispatch({
                type: "derive: Enter",
                deriveId: data.id,
                deriveType: data.type
            });
            break;
    }
}

export function getBrowseBuildFn(state: BrowseState, dispatch: Dispatch<Action>): BuildFunction {
    const template = createTemplateBuildFn(dispatch);
    return (Component, data) => {
        let output = template(Component, data);
        if (data.selected && data.head) {
            const menuItems: ContextMenuItems = ["Expand", "Edit", "Derive"];
            output = withContextMenu(output, () => (
                <ContextMenu
                    onItemSelect={(item) => {
                        contextMenuItemSelect(
                            dispatch,
                            data,
                            item as ContextMenuItemType
                        );
                    }}
                >
                    {menuItems}
                </ContextMenu>
            ));
        }
        return output;
    };
}