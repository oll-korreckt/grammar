import { ElementId } from "@domain/language";
import { createContext } from "react";

export interface ElementMenuContext {
    id: ElementId;
}

export const ElementMenuContext = createContext<ElementMenuContext>({ id: "" });