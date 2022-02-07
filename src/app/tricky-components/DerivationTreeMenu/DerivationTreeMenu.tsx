import { accessClassName, DerivationTarget, DerivationTree, DerivationTreeItem, ElementDisplayInfo, useOutsideClick } from "@app/utils";
import { ElementType } from "@domain/language";
import React from "react";
import { useState } from "react";
import { useContext } from "react";
import { Banner } from "./Banner";
import { DerivationContext } from "./derivation-context";
import styles from "./_styles.modules.scss";

export interface RefinedDerivationTarget {
    type: Exclude<ElementType, "word">;
    property: string;
}

type OnSelect = (tgt: RefinedDerivationTarget) => void;

export interface DerivationTreeMenuProps {
    children: DerivationTree;
    onSelect?: OnSelect;
    onCancel?: () => void;
}

export const DerivationTreeMenu: React.VFC<DerivationTreeMenuProps> = ({ children, onSelect, onCancel }) => {
    const callOnSelect: OnSelect = (tgt) => onSelect && onSelect(tgt);
    const callOnCancel = () => onCancel && onCancel();
    const ref = useOutsideClick<HTMLDivElement>(callOnCancel);
    const [state, setState] = useState<DerivationTarget>();

    return (
        <div className={accessClassName(styles, "menu")} ref={ref}>
            {state === undefined
                ?
                <>
                    <Banner onCancel={callOnCancel} />
                    <div className={accessClassName(styles, "menuBody")}>
                        <TypeSelectPrompt
                            callFinal={callOnSelect}
                            enterPropertySelect={setState}
                        >
                            {children}
                        </TypeSelectPrompt>
                    </div>
                </>
                :
                <>
                    <Banner
                        onBack={() => setState(undefined)}
                        onCancel={callOnCancel}
                    >
                        Select Property
                    </Banner>
                    <div className={accessClassName(styles, "menuBody")}>
                        <PropertySelectPrompt onSelect={callOnSelect}>
                            {state}
                        </PropertySelectPrompt>
                    </div>
                </>
            }
        </div>
    );
};

interface TypeSelectPromptProps {
    callFinal: OnSelect;
    enterPropertySelect: (tgt: DerivationTarget) => void;
    children: DerivationTree;
}

const TypeSelectPrompt: React.VFC<TypeSelectPromptProps> = ({ callFinal, enterPropertySelect, children }) => {
    const { partOfSpeech, phrase, clause } = children;
    const context: DerivationContext = {
        onSelect: (tgt) => {
            tgt.properties.length > 1
                ? enterPropertySelect(tgt)
                : callFinal({
                    type: tgt.type,
                    property: tgt.properties[0]
                });
        }
    };
    return (
        <DerivationContext.Provider value={context}>
            {partOfSpeech &&
                <SubMenu title="Part of Speech">
                    {partOfSpeech}
                </SubMenu>
            }
            {phrase &&
                <SubMenu title="Phrase">
                    {phrase}
                </SubMenu>
            }
            {clause &&
                <SubMenu title="Clause">
                    {clause}
                </SubMenu>
            }
        </DerivationContext.Provider>
    );
};

interface SubMenuProps {
    title: string;
    children: DerivationTreeItem[];
}

export const SubMenu: React.VFC<SubMenuProps> = ({ title, children }) => {
    return (
        <>
            <div className={accessClassName(styles, "subMenuTitle")}>
                {title}
            </div>
            {children.map((item) => (
                <MenuItem key={item.baseType}>
                    {item}
                </MenuItem>
            ))}
        </>
    );
};

interface MenuItemProps {
    children: DerivationTreeItem;
}

export const MenuItem: React.VFC<MenuItemProps> = ({ children }) => {
    const context = useContext(DerivationContext);
    const { baseType, primaryType, coordType } = children;
    const displayInfo = ElementDisplayInfo.getDisplayInfo(baseType);
    const menuItemBtns: string[] = ["menuItemBtns"];
    let propCnt = 0;
    if (primaryType) {
        propCnt++;
    }
    if (coordType) {
        propCnt++;
    }
    switch (propCnt) {
        case 1:
            menuItemBtns.push("centerButtons");
            break;
        case 2:
            menuItemBtns.push("splitButtons");
            break;
        default:
            throw `Unhandled number of properties: ${propCnt}`;
    }
    return (
        <div className={accessClassName(styles, "menuItemContainer")}>
            <div className={accessClassName(styles, "menuItem")}>
                <div className={accessClassName(styles, "menuItemName")}>
                    {displayInfo.fullName}
                </div>
                <div className={accessClassName(styles, ...menuItemBtns)}>
                    {primaryType &&
                        <button
                            className={accessClassName(styles, "menuItemBtn", "single")}
                            onClick={() => context.onSelect(primaryType)}
                        >
                            Single
                        </button>
                    }
                    {coordType &&
                        <div className={accessClassName(styles, "center")}>
                            <button
                                className={accessClassName(styles, "menuItemBtn", "coordinated")}
                                onClick={() => context.onSelect(coordType)}
                            >
                                Coord.
                            </button>
                        </div>
                    }
                </div>
            </div>
        </div>
    );
};

interface PropertySelectPromptProps {
    children: DerivationTarget;
    onSelect: OnSelect;
}

type PropertyInfo = {
    displayName: string;
    propertyName: string;
}

export const PropertySelectPrompt: React.VFC<PropertySelectPromptProps> = ({ children, onSelect }) => {
    const { type, properties } = children;
    const info = ElementDisplayInfo.getDisplayInfo(type);
    const propertyInfos: PropertyInfo[] = properties.map((prop) => {
        return {
            displayName: info.properties[prop].fullName,
            propertyName: prop
        };
    }).sort((a, b) => {
        const aOrder = info.properties[a.propertyName].displayOrder;
        const bOrder = info.properties[b.propertyName].displayOrder;
        return aOrder - bOrder;
    });
    return (
        <div className={accessClassName(styles, "propertySelectContainer")}>
            <div className={accessClassName(styles, "propertySelect")}>
                {propertyInfos.map(({ propertyName, displayName }) => (
                    <button
                        key={propertyName}
                        className={accessClassName(styles, "propertySelectItem")}
                        onClick={() => onSelect({ type: type, property: propertyName })}
                    >
                        {displayName}
                    </button>
                ))}
            </div>
        </div>
    );
};