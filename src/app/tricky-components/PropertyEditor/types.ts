import { ElementDisplayInfo } from "@app/utils";
import { ElementType } from "@domain/language";
import { Variant, Variants } from "framer-motion";
import { createContext } from "react";

export type PropertyEditorAction = {
    type: "property edit";
    property: string;
} | {
    type: "property cancel";
    property: string;
} | {
    type: "exit edit";
}

export type ActionDispatch = (action: PropertyEditorAction) => void;

export function createInvoke(dispatch: ActionDispatch | undefined): ActionDispatch {
    return (action) => dispatch && dispatch(action);
}

export type PropertyData = ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]] & {
    key: string;
}

export const INVALID_PROPERTY = "$";

export interface PropertyContext {
    motionProperty: string;
}

export type ChildVariants = {
    hidden?: Variant;
    show?: Variant;
    exit?: Variant;
}

export const DURATION = 10;

// export const PropertyContext = createContext<PropertyContext>({ motionProperty: INVALID_PROPERTY });