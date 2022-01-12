import { HeadLabel, Word, WordLabel } from "@app/basic-components/Word";
import { ElementDisplayInfo } from "@app/utils";
import { makeRefComponent, withEventProp } from "@app/utils/hoc";
import { ElementId } from "@domain/language";
import { LabelData, Utils, Lexeme } from "./utils";
import React from "react";
import { FaExternalLinkAlt } from "react-icons/fa";


export interface LabelViewProps {
    children?: LabelData[];
    headers?: Record<ElementId, string>;
    onLabelClick?: (id: ElementId) => void;
}

function incrementIdCount(idCounts: Record<ElementId, number>, id: ElementId): number {
    if (!(id in idCounts)) {
        idCounts[id] = 0;
    }
    const output = idCounts[id];
    idCounts[id]++;
    return output;
}

const LinkIcon: React.VFC = () => (
    <>
        &nbsp;
        <FaExternalLinkAlt/>
    </>
);

export const LabelView = makeRefComponent<HTMLDivElement, LabelViewProps>("LabelView", ({ children, headers, onLabelClick }, ref) => {
    const labels = Utils.scan(children);
    const defHeaders: Record<ElementId, string> = headers !== undefined
        ? headers
        : {};
    const idCounts: Record<ElementId, number> = {};
    let whitespaceCnt = 0;

    return (
        <div ref={ref}>
            {labels.map((label) => {
                if (label.type === "whitespace") {
                    return (
                        <span key={whitespaceCnt++}>
                            {label.lexeme}
                        </span>
                    );
                }
                const { id, elementType, lexemes, referenced } = label;
                const idCnt = incrementIdCount(idCounts, id);
                const displayInfo = ElementDisplayInfo.getDisplayInfo(elementType);
                const lexemeArray: Lexeme[] = Array.isArray(lexemes)
                    ? lexemes
                    : [lexemes];
                const labelKey = `${id}-${idCnt}`;
                return (
                    <ExtendedWordLabel
                        color={displayInfo.color}
                        key={labelKey}
                        onClick={() => onLabelClick && onLabelClick(id)}
                    >
                        {lexemeArray.map(({ type, lexeme }, index) => {
                            const lexemeKey = `${id}-${index}`;
                            if (type === "whitespace") {
                                return (
                                    <Word key={lexemeKey}>
                                        {lexeme}
                                    </Word>
                                );
                            } else {
                                const isHead = idCnt === 0 && index === 0;
                                const prescribedHeader = defHeaders[id];
                                const header = prescribedHeader !== undefined
                                    ? prescribedHeader
                                    : displayInfo.header;
                                return (
                                    <Word key={lexemeKey}>
                                        {isHead &&
                                            <HeadLabel>
                                                {header}
                                                {referenced !== undefined
                                                    ? <LinkIcon/>
                                                    : ""
                                                }
                                            </HeadLabel>
                                        }
                                        {lexeme}
                                    </Word>
                                );
                            }
                        })}
                    </ExtendedWordLabel>
                );
            })}
        </div>
    );
});

const ExtendedWordLabel = withEventProp(WordLabel, "click");