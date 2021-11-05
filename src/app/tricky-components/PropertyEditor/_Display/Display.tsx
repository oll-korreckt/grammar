import React from "react";
import { ActionDispatch, PropertyData } from "../types";
import { Fade } from "../_Fade/Fade";
import { PropertySection, PropertySectionProps } from "../_PropertySection/PropertySection";

export interface DisplayProps {
    assigned: PropertyData[];
    unassigned: PropertyData[];
    actionDispatch: ActionDispatch;
}

export const Display: React.VFC<DisplayProps> = ({ assigned, unassigned, actionDispatch }) => {
    return (
        <div>
            {/* <Fade type="fade in" /> */}
            <Fade firstMount />
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