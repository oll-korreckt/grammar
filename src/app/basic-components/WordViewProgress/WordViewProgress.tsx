import { accessClassName, DiagramStateContext, WordViewCategory, WordViewContext } from "@app/utils";
import { makeRefComponent, RefComponent, withClassName } from "@app/utils/hoc";
import React, { useContext } from "react";
import { ProgressBar } from "../ProgressBar";
import styles from "./_styles.scss";

export interface WordViewProgressProps {
    buildFn?: (Component: RefComponent<HTMLDivElement>, category: WordViewCategory) => RefComponent<HTMLDivElement>;
}

export const WordViewProgress: React.VFC<WordViewProgressProps> = ({ buildFn }) => {
    const { progress } = useContext(DiagramStateContext);
    const { category } = useContext(WordViewContext);
    let PartOfSpeech = makeProgressItem(
        "Part of Speech",
        progress.partOfSpeech.percentage
    );
    let PhrasesAndClauses = makeProgressItem(
        "Phrases + Clauses",
        progress.phraseAndClause.percentage
    );
    const selectedItem = accessClassName(styles, "selectedItem");
    let statusBits = 0;
    const partOfSpeechBit = 1 << 0;
    const posCompleteBit = 1 << 1;
    switch (category) {
        case "partOfSpeech":
            statusBits |= partOfSpeechBit;
            PartOfSpeech = withClassName(PartOfSpeech, selectedItem);
            break;
        case "phraseAndClause":
            PhrasesAndClauses = withClassName(PhrasesAndClauses, selectedItem);
            break;
        default:
            throw `unsuppored category '${category}'`;
    }
    if (progress.partOfSpeech.percentage === 100) {
        statusBits |= posCompleteBit;
    }
    const enableClick = accessClassName(styles, "enableClick");
    const disableClick = accessClassName(styles, "disableClick");
    switch (statusBits) {
        case partOfSpeechBit:
            PartOfSpeech = withClassName(PartOfSpeech, disableClick);
            PhrasesAndClauses = withClassName(PhrasesAndClauses, disableClick);
            break;
        case partOfSpeechBit | posCompleteBit:
            PartOfSpeech = withClassName(PartOfSpeech, disableClick);
            PhrasesAndClauses = withClassName(PhrasesAndClauses, enableClick);
            break;
        case posCompleteBit:
            PartOfSpeech = withClassName(PartOfSpeech, enableClick);
            PhrasesAndClauses = withClassName(PhrasesAndClauses, disableClick);
            break;
        default:
            throw `unhandled state ${statusBits}`;
    }
    if (buildFn) {
        PartOfSpeech = buildFn(PartOfSpeech, "partOfSpeech");
        PhrasesAndClauses = buildFn(PhrasesAndClauses, "phraseAndClause");
    }
    return (
        <div className={accessClassName(styles, "wordViewCategory")}>
            <PartOfSpeech/>
            <PhrasesAndClauses/>
        </div>
    );
};

const TransitionProgressBar = withClassName(ProgressBar, accessClassName(styles, "progressBar"));

function makeProgressItem(children: string, percentage: number): RefComponent<HTMLDivElement> {
    const className = percentage === 100 ? "blue" : "green";
    return makeRefComponent<HTMLDivElement>("ProgressItem", (_, ref) => {
        return (
            <div ref={ref}>
                <div className={accessClassName(styles, "item")}>
                    {children}
                </div>
                <TransitionProgressBar percentage={percentage}>
                    <div className={accessClassName(styles, className)}></div>
                    <div className={accessClassName(styles, "red")}></div>
                </TransitionProgressBar>
            </div>

        );
    });
}