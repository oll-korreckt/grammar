import { accessClassName, DiagramStateItem, ElementDisplayInfo } from "@app/utils";
import { ElementReference, ElementType, getElementDefinition } from "@domain/language";
import React from "react";
import { CategorySelector } from "../CategorySelector";
import { IoPricetagOutline, IoPricetag, IoPricetagsOutline, IoPricetags } from "react-icons/io5";
import styles from "./_styles.modules.scss";

export interface PropertySelectorProps {
    item: DiagramStateItem;
    selectedProperty: string | undefined;
    onSelectChange?: (property: string | undefined) => void;
}

type PropertyInfoBase = Omit<ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]], "displayOrder" | "fullName" | "abrName">;
type PropertyInfo = PropertyInfoBase & {
    propertyName: string;
    isArray: boolean;
    hasItems: boolean;
    displayName: string;
};

function getPropertyDisplayInfo(item: DiagramStateItem): PropertyInfo[] {
    const output: PropertyInfo[] = [];
    const elementDef = getElementDefinition(item.type as Exclude<ElementType, "word">);
    const displayInfo = ElementDisplayInfo.getDisplayInfo(item.type);
    Object.entries(displayInfo.properties).forEach(([key, { displayOrder, ...rest }]) => {
        const [isArray] = elementDef[key];
        const elementValue = item.value as unknown as Record<string, ElementReference | ElementReference[]>;
        output[displayOrder] = {
            required: rest.required,
            propertyName: key,
            isArray: isArray,
            hasItems: elementValue[key] !== undefined,
            displayName: ElementDisplayInfo.getAbbreviatedName(rest)
        };
    });
    return output;
}

export const PropertySelector: React.VFC<PropertySelectorProps> = ({ item, selectedProperty, onSelectChange }) => {
    const properties = getPropertyDisplayInfo(item);

    return (
        <CategorySelector>
            {properties.map((property) => {
                const isSelected = property.propertyName === selectedProperty;
                const classNames: string[] = [
                    "property",
                    isSelected ? "selected" : "unselected"
                ];
                if (isSelected) {
                    classNames.push("selected");
                }
                return (
                    <div
                        key={property.propertyName}
                        onClick={() => {
                            const newValue = isSelected ? undefined : property.propertyName;
                            onSelectChange && onSelectChange(newValue);
                        }}
                        className={accessClassName(styles, ...classNames)}
                    >
                        <div className={accessClassName(styles, "label")}>
                            {property.displayName}
                        </div>
                        <div className={accessClassName(styles, "icon")}>
                            {property.isArray
                                ? property.hasItems
                                    ? <IoPricetags />
                                    : <IoPricetagsOutline />
                                : property.hasItems
                                    ? <IoPricetag />
                                    : <IoPricetagOutline />
                            }
                        </div>
                    </div>
                );
            })}
        </CategorySelector>
    );
};