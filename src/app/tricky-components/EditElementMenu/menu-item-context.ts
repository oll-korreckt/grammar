import { createContext } from "react";
import { ElementId, ElementReference, ElementType } from "@domain/language";

export type MenuItemContext = {
    id: ElementId;
    propertyLabel: string;
    elementTypes: ElementType[];
    required: boolean;
    isArray: boolean;
    reference?: ElementReference | ElementReference[];
    deleteReference: (id: ElementId) => void;
}

export const MenuItemContext = createContext<MenuItemContext>({
    id: "",
    propertyLabel: "",
    elementTypes: [],
    required: false,
    isArray: false,
    deleteReference: () => { throw "not implemented"; }
});