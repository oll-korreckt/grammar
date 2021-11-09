import React from "react";
import { ActionDispatch, PropertyData } from "../types";
import { PropertySection, PropertySectionProps } from "../_PropertySection/PropertySection";

export interface DisplayProps {
    assigned: PropertyData[];
    unassigned: PropertyData[];
    actionDispatch: ActionDispatch;
}

export const Display: React.VFC<DisplayProps> = ({ assigned, unassigned, actionDispatch }) => {
    return (
        <div>
            <PropertySection
                properties={assigned}
                onAction={actionDispatch}
            >
                {"Assigned" as PropertySectionProps["children"]}
            </PropertySection>
            <PropertySection
                properties={unassigned}
                onAction={actionDispatch}
            >
                {"Unassigned" as PropertySectionProps["children"]}
            </PropertySection>
        </div>
    );
};