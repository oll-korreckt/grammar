import { accessClassName, useUpdateDisplayState, AnimationIdBuilderUtils, ClickListenerContext, ControlAnimationContext, DisplayModeContext, ControlAnimationUtils } from "@app/utils";
import { makeRefComponent, withClassNameProp } from "@app/utils/hoc";
import { ElementCategory } from "@domain/language";
import { AnimateSharedLayout, motion } from "framer-motion";
import React, { PropsWithChildren, useContext, useEffect } from "react";
import { IconType } from "react-icons";
import { FaLayerGroup, FaAngleUp } from "react-icons/fa";
import styles from "./_styles.module.scss";

export interface NavigateMenuProps {
    category?: ElementCategory;
    onCategoryChange?: (newCat: ElementCategory) => void;
    enableUpLevel?: boolean | undefined;
    onUpLevel?: () => void;
}

export const NavigateMenu = makeRefComponent<HTMLDivElement, PropsWithChildren<NavigateMenuProps>>("NavigateMenu", ({ category, onCategoryChange, enableUpLevel, onUpLevel }, ref) => {
    const { displayMode } = useContext(DisplayModeContext);
    const defaultCategory = ElementCategory.getDefault(category);
    const updateDisplay = useUpdateDisplayState();

    function invokeCategoryChange(newCat: ElementCategory): void {
        if (onCategoryChange) {
            onCategoryChange(newCat);
        }
    }

    useEffect(() => {
        updateDisplay({
            type: "navigate",
            category,
            enableUpLevel
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [category, enableUpLevel]);

    const animateBase = "navigate-menu";

    return (
        <div
            ref={ref}
            className={accessClassName(styles, displayMode === "full screen" ? "navigateMenu" : "navigateMenuPartial")}
        >
            <div className={accessClassName(styles, "upContainer")}>
                <ExtendedItem
                    icon={FaAngleUp}
                    onClick={() => onUpLevel && onUpLevel()}
                    animateId={AnimationIdBuilderUtils.extendId(animateBase, "up-level")}
                    className={accessClassName(
                        styles,
                        ...(enableUpLevel ? [] : ["disableUpLevel"])
                    )}
                >
                    Up
                </ExtendedItem>
                <div className={accessClassName(styles, "border")} />
            </div>
            <div className={accessClassName(styles, "categoryContainer")}>
                <AnimateSharedLayout type="crossfade">
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "word"}
                        animateId={AnimationIdBuilderUtils.extendId(animateBase, "word")}
                        onClick={() => invokeCategoryChange("word")}
                    >
                        Word
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "partOfSpeech"}
                        animateId={AnimationIdBuilderUtils.extendId(animateBase, "category")}
                        onClick={() => invokeCategoryChange("partOfSpeech")}
                    >
                        Category
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "phrase"}
                        animateId={AnimationIdBuilderUtils.extendId(animateBase, "phrase")}
                        onClick={() => invokeCategoryChange("phrase")}
                    >
                        Phrase
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "clause"}
                        animateId={AnimationIdBuilderUtils.extendId(animateBase, "clause")}
                        onClick={() => invokeCategoryChange("clause")}
                    >
                        Clause
                    </Item>
                    <Item
                        icon={FaLayerGroup}
                        selected={defaultCategory === "sentence"}
                        animateId={AnimationIdBuilderUtils.extendId(animateBase, "sentence")}
                        onClick={() => invokeCategoryChange("sentence")}
                    >
                        Sentence
                    </Item>
                </AnimateSharedLayout>
            </div>
        </div>
    );
});

interface ItemProps {
    icon: IconType;
    onClick?: () => void;
    selected?: boolean;
    children: string;
    animateId?: string;
}

const Item = makeRefComponent<HTMLDivElement, ItemProps>("Item", ({ icon, onClick, selected, animateId, children }, ref) => {
    const { onElementClick } = useContext(ClickListenerContext);
    const { activeElement } = useContext(ControlAnimationContext);

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);

    const iconClasses = ["icon"];
    const childrenClasses = ["children"];
    if (isAnimating) {
        iconClasses.push("pulseAnimate");
        childrenClasses.push("pulseAnimate");
    }

    const Icon = icon;
    return (
        <div
            ref={ref}
            className={accessClassName(styles, "item")}
        >
            <div
                className={accessClassName(styles, "itemContent")}
                onClick={() => {
                    onElementClick && onElementClick(animateId);
                    onClick && onClick();
                }}
            >
                <Icon className={accessClassName(styles, ...iconClasses)} />
                <div className={accessClassName(styles, ...childrenClasses)}>
                    {children}
                </div>
                {selected &&
                    <motion.div
                        className={accessClassName(styles, "underline")}
                        layout
                        layoutId="underline"
                    />
                }
            </div>
        </div>
    );
});

const ExtendedItem = withClassNameProp(Item);