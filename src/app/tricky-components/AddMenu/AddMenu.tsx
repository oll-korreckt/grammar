import { makeRefComponent } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useState } from "react";
import { AddMenuCategory, AddMenuView } from "../AddMenuView";

export interface AddMenuProps {
    children?: Exclude<ElementType, "word">[];
    onElementSelect?: (element: Exclude<ElementType, "word">) => void;
}

export const AddMenu = makeRefComponent<HTMLDivElement, AddMenuProps>("AddMenu", ({ children, onElementSelect }, ref) => {
    const [category, setCategory] = useState<AddMenuCategory>();

    return (
        <AddMenuView
            ref={ref}
            category={category}
            onCategorySelect={setCategory}
            onElementSelect={onElementSelect}
        >
            {children}
        </AddMenuView>
    );
});