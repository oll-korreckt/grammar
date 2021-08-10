import { ElementSelectNode, SelectedElement } from "@app/utils";
import { RefComponent } from "@app/utils/hoc";
import { createContext } from "react";

export type SelectedItemDisplayBuildFunction = (Component: RefComponent<HTMLDivElement>, item: ElementSelectNode) => RefComponent<HTMLDivElement>;

export interface SelectedItemDisplayContext {
    selectedItem?: SelectedElement;
    buildFn?: SelectedItemDisplayBuildFunction;
    onClear?: () => void;
}

export const SelectedItemDisplayContext = createContext<SelectedItemDisplayContext>({});