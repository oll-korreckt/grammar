import { accessClassName, DiagramStateContext, WordViewCategory, WordViewContext } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import React, { useContext } from "react";
import { IconType } from "react-icons";
import { FaSquare, FaSitemap } from "react-icons/fa";
import { CircleContainer } from "../CircleContainer";
import { CircleProgress, HsvColor } from "../CircleProgress/CircleProgress";
import styles from "./_styles.scss";

export type ModeSelectorState = {
    category: WordViewCategory;
    progress: {
        partOfSpeech: number;
        phraseAndClause: number;
    };
}

function getState({ progress }: DiagramStateContext, { category }: WordViewContext): ModeSelectorState {
    const output: ModeSelectorState = {
        category: category,
        progress: {
            partOfSpeech: progress.partOfSpeech.percentage,
            phraseAndClause: progress.phraseAndClause.percentage
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
    children: ModeSelectorState;
    onCategorySwitch?: (cateogry: WordViewCategory) => void;
}

function checkState(state: ModeSelectorState): void {
    function checkProgress(progress: number): void {
        if (progress < 0 || progress > 100) {
            throw `progress must be a value between 0 and 100 (inclusive). received: ${progress}`;
        }
    }

    const { partOfSpeech, phraseAndClause } = state.progress;
    checkProgress(partOfSpeech);
    checkProgress(phraseAndClause);
    if (state.category === "phraseAndClause" && partOfSpeech !== 100) {
        const partOfSpeechCat: WordViewCategory = "partOfSpeech";
        throw `cannot be in ${state.category} while ${partOfSpeechCat} is incomplete`;
    }
}

export const ModeSelectorDisplay = makeRefComponent<HTMLDivElement, ModeSelectorDisplayProps>("ModeSelectorDisplay", ({ children, onCategorySwitch }, ref) => {
    checkState(children);
    const posClasses: string[] = [];
    const pacClasses: string[] = [];
    switch (children.category) {
        case "partOfSpeech":
            posClasses.push("selected");
            break;
        case "phraseAndClause":
            pacClasses.push("selected");
            break;
    }
    if (children.progress.partOfSpeech !== 100) {
        pacClasses.push("disabled");
    }

    return (
        <div ref={ref}>
            <ExtendedModeItem
                icon={FaSquare}
                progress={children.progress.partOfSpeech}
                onClick={() => onCategorySwitch && onCategorySwitch("partOfSpeech")}
                className={accessClassName(styles, ...posClasses)}
            >
                Category
            </ExtendedModeItem>
            <ExtendedModeItem
                icon={FaSitemap}
                progress={children.progress.phraseAndClause}
                onClick={() => onCategorySwitch && onCategorySwitch("phraseAndClause")}
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