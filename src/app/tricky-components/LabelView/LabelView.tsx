import { Colors } from "@app/utils";
import { makeRefComponent, withEventProp } from "@app/utils/hoc";
import { ElementId } from "@domain/language";
import { Lexeme, Utils } from "./utils";
import React from "react";
import { Label } from "@app/basic-components/Label";

export interface LabelViewProps {
    children?: Lexeme[];
    settings?: Record<ElementId, LabelSettings>;
    onLabelClick?: (id: ElementId) => void;
}

export interface LabelSettings {
    fade?: boolean | undefined;
    color?: Colors;
    header?: string | undefined;
}

function incrementIdCount(idCounts: Record<ElementId, number>, id: ElementId): number {
    if (!(id in idCounts)) {
        idCounts[id] = 0;
    }
    const output = idCounts[id];
    idCounts[id]++;
    return output;
}

export const LabelView = makeRefComponent<HTMLDivElement, LabelViewProps>("LabelView", ({ children, settings, onLabelClick }, ref) => {
    const labels = Utils.scan(children);
    const defSettings: Record<ElementId, LabelSettings> = settings ? settings : {};
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
                const { id, lexemes } = label;
                const idCnt = incrementIdCount(idCounts, id);
                const { fade, color, header }: LabelSettings = id in defSettings ? defSettings[id] : {};
                const labelKey = `${id}-${idCnt}`;
                return (
                    <ExtendedLabel
                        key={labelKey}
                        header={idCnt === 0 ? header : undefined}
                        color={color}
                        fade={fade}
                        onClick={() => onLabelClick && onLabelClick(id)}
                    >
                        {lexemes.map(({ lexeme }) => lexeme)}
                    </ExtendedLabel>
                );
            })}
        </div>
    );
});

const ExtendedLabel = withEventProp(Label, "click");