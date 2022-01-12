import { ElementId, ElementType } from "@domain/language";

interface ElementLexeme {
    type: "element";
    lexeme: string;
}

interface WhitespaceLexeme {
    type: "whitespace";
    lexeme: string;
}

export type Lexeme = ElementLexeme | WhitespaceLexeme;

export type LabelData =
    | ElementLabelData
    | WhitespaceLabelData;

export interface ElementLabelData {
    type: "element";
    lexeme: string;
    id: ElementId;
    elementType: ElementType;
    referenced?: boolean | undefined;
}

export type WhitespaceLabelData = WhitespaceLexeme;

export type ConsolidatedLabel =
    | ConsolidatedElementLabel
    | ConsolidatedWhitespaceLabel;

interface ConsolidatedElementLabel {
    type: "element";
    id: ElementId;
    elementType: ElementType;
    referenced?: boolean | undefined;
    lexemes: ElementLexeme | Lexeme[];
}

type ConsolidatedWhitespaceLabel = WhitespaceLexeme;

interface Data {
    start: number;
    current: number;
    labels: LabelData[];
    output: ConsolidatedLabel[];
}

function advance(data: Data): LabelData {
    data.current++;
    return data.labels[data.current - 1];
}

function isAtEnd(data: Data): boolean {
    return data.current >= data.labels.length;
}

function match(data: Data, matchFn: (label: LabelData) => boolean): boolean {
    const peekLabel = peek(data);
    if (peekLabel === "end") {
        return false;
    }
    if (!matchFn(peekLabel)) {
        return false;
    }
    data.current++;
    return true;
}

function peek(data: Data): LabelData | "end" {
    if (isAtEnd(data)) {
        return "end";
    }
    return data.labels[data.current];
}

function scan(labels: LabelData[] | undefined): ConsolidatedLabel[] {
    if (labels === undefined) {
        return [];
    }
    const data: Data = {
        start: 0,
        current: 0,
        labels: labels,
        output: []
    };
    while (!isAtEnd(data)) {
        data.start = data.current;
        next(data);
    }
    return data.output;
}

function next(data: Data): void {
    const current = advance(data);
    if (current.type === "whitespace") {
        data.output.push({
            type: current.type,
            lexeme: current.lexeme
        });
    } else {
        return finishElementLabel(data, current);
    }
}

function makeLabelMatchFn(id: ElementId): (label: LabelData) => boolean {
    return (label) => {
        return label.type === "whitespace" || label.id === id;
    };
}

function excludeLexeme(elementLabel: ElementLabelData): Omit<ElementLabelData, "lexeme"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { lexeme, ...output } = elementLabel;
    return output;
}

function finishElementLabel(data: Data, elementLabel: ElementLabelData): void {
    const matchFn = makeLabelMatchFn(elementLabel.id);
    while (match(data, matchFn)) {
        // advance
    }
    const { start, current, labels, output } = data;
    const peekLabel = peek(data);
    if (peekLabel === "end") {
        const lexemes = labels.slice(start, current).map(labelToLexeme);
        output.push(createConsolidatedElementLabel(
            excludeLexeme(elementLabel),
            lexemes
        ));
    } else {
        const lexemes: Lexeme[] = labels.slice(start, current - 1).map(labelToLexeme);
        output.push(createConsolidatedElementLabel(
            excludeLexeme(elementLabel),
            lexemes
        ));
        output.push({
            type: "whitespace",
            lexeme: labels[current - 1].lexeme
        });
    }
}

function createConsolidatedElementLabel(labelData: Omit<ElementLabelData, "lexeme">, lexemes: Lexeme[]): ConsolidatedElementLabel {
    const output: ConsolidatedElementLabel = lexemes.length === 1
        ?
        {
            type: "element",
            id: labelData.id,
            elementType: labelData.elementType,
            lexemes: lexemes[0] as ElementLexeme
        }
        :
        {
            type: "element",
            id: labelData.id,
            elementType: labelData.elementType,
            lexemes
        };
    if (labelData.referenced !== undefined) {
        output.referenced = labelData.referenced;
    }
    return output;
}

function labelToLexeme(label: LabelData): Lexeme {
    return {
        type: label.type,
        lexeme: label.lexeme
    };
}


export const Utils = {
    scan
};