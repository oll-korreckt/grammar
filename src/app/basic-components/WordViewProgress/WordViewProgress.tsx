import { accessClassName, DiagramStateContext, WordViewStage, WordViewContext } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import React, { useContext } from "react";
import { IconType } from "react-icons";
import { FaSquare, FaSitemap } from "react-icons/fa";
import { CircleContainer } from "../CircleContainer";
import { CircleProgress, HsvColor } from "../CircleProgress/CircleProgress";
import styles from "./_styles.scss";


export type WordViewProgressState = {
    stage: WordViewStage;
    progress: {
        [Key in WordViewStage]: number;
    };
}

function getState({ progress }: DiagramStateContext, { stage }: WordViewContext): WordViewProgressState {
    const output: WordViewProgressState = {
        stage: stage,
        progress: {
            category: progress.category.percentage,
            syntax: progress.syntax.percentage
        }
    };
    return output;
}

export const ModeSelector = makeRefComponent<HTMLDivElement>("ModeSelector", (_, ref) => {
    const dsContext = useContext(DiagramStateContext);
    const wvContext = useContext(WordViewContext);
    const state = getState(dsContext, wvContext);
    return <ModeSelectorDisplay ref={ref}>{state}</ModeSelectorDisplay>;
});

export interface ModeSelectorDisplayProps {
    children: WordViewProgressState;
    onStageChange?: (stage: WordViewStage) => void;
}

function checkState(state: WordViewProgressState): void {
    function checkProgress(progress: number): void {
        if (progress < 0 || progress > 100) {
            throw `progress must be a value between 0 and 100 (inclusive). received: ${progress}`;
        }
    }

    const { category, syntax } = state.progress;
    checkProgress(category);
    checkProgress(syntax);
    if (state.stage === "syntax" && category !== 100) {
        const categoryName: WordViewStage = "category";
        throw `cannot be in ${state.stage} while ${categoryName} is incomplete`;
    }
}

export const ModeSelectorDisplay = makeRefComponent<HTMLDivElement, ModeSelectorDisplayProps>("ModeSelectorDisplay", ({ children, onStageChange }, ref) => {
    checkState(children);
    const posClasses: string[] = [];
    const pacClasses: string[] = [];
    switch (children.stage) {
        case "category":
            posClasses.push("selected");
            break;
        case "syntax":
            pacClasses.push("selected");
            break;
    }
    if (children.progress.category !== 100) {
        pacClasses.push("disabled");
    }

    return (
        <div ref={ref}>
            <ExtendedModeItem
                icon={FaSquare}
                progress={children.progress.category}
                onClick={() => onStageChange && onStageChange("category")}
                className={accessClassName(styles, ...posClasses)}
            >
                Category
            </ExtendedModeItem>
            <ExtendedModeItem
                icon={FaSitemap}
                progress={children.progress.syntax}
                onClick={() => onStageChange && onStageChange("syntax")}
                className={accessClassName(styles, ...pacClasses)}
            >
                Syntax
            </ExtendedModeItem>
        </div>
    );
});

export interface ModeItemProps {
    icon: IconType;
    progress: number;
    children: string;
}

export const ModeItem = makeRefComponent<HTMLDivElement, ModeItemProps>("ModeItem", ({ children, icon, progress }, ref) => {
    const Icon = icon;
    const colors: HsvColor[] = [
        { hue: 0, saturation: 100, lightness: 50 },
        { hue: 225, saturation: 100, lightness: 50 }
    ];
    return (
        <div className={accessClassName(styles, "container")} ref={ref}>
            <CircleProgress
                progress={progress}
                thickness="4px"
                colors={colors}
            >
                <CircleContainer>
                    <div className={accessClassName(styles, "modeItem")}>
                        <div className={accessClassName(styles, "icon")}>
                            <Icon/>
                        </div>
                        <div className={accessClassName(styles, "text")}>
                            {children}
                        </div>
                    </div>
                </CircleContainer>
            </CircleProgress>
        </div>
    );
});

const ExtendedModeItem = withClassNameProp(withEventProp(ModeItem, "click"));