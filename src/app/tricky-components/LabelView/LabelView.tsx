import { accessClassName, ClickListenerContext, Colors } from "@app/utils";
import { makeRefComponent, withClassNameProp, withEventProp } from "@app/utils/hoc";
import { ElementId } from "@domain/language";
import { Lexeme, Utils } from "./utils";
import React, { useContext } from "react";
import { Label } from "@app/basic-components/Label";
import styles from "./_styles.module.scss";

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
    const { onElementClick } = useContext(ClickListenerContext);
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
                const containsId = id in defSettings;
                const { fade, color, header }: LabelSettings = containsId ? defSettings[id] : {};
                const labelKey = `${id}-${idCnt}`;
                const classes = [];
                if (!containsId) {
                    classes.push("disableClick");
                }
                return (
                    <ExtendedLabel
                        key={labelKey}
                        header={idCnt === 0 ? header : undefined}
                        color={color}
                        fade={fade}
                        animateId={id}
                        onClick={() => {
                            onElementClick && onElementClick(id);
                            onLabelClick && onLabelClick(id);
                        }}
                        className={accessClassName(styles, ...classes)}
                    >
                        {lexemes.map(({ lexeme }) => lexeme)}
                    </ExtendedLabel>
                );
            })}
        </div>
    );
});

const ExtendedLabel = withClassNameProp(withEventProp(Label, "click"));