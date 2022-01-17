import { ElementId } from "@domain/language";

interface ElementLexeme {
    type: "element";
    lexeme: string;
    id: ElementId;
}

interface WhitespaceLexeme {
    type: "whitespace";
    lexeme: string;
}

export type Lexeme = ElementLexeme | WhitespaceLexeme;

export interface ConsolidatedElementLexeme {
    type: "element";
    id: ElementId;
    lexemes: (Omit<ElementLexeme, "id"> | WhitespaceLexeme)[];
}

interface Data {
    start: number;
    current: number;
    lexemes: Lexeme[];
    output: (ConsolidatedElementLexeme | WhitespaceLexeme)[];
}

function advance(data: Data): Lexeme {
    data.current++;
    return data.lexemes[data.current - 1];
}

function isAtEnd(data: Data): boolean {
    return data.current >= data.lexemes.length;
}

function match(data: Data, matchFn: (lexeme: Lexeme) => boolean): boolean {
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

function peek(data: Data): Lexeme | "end" {
    if (isAtEnd(data)) {
        return "end";
    }
    return data.lexemes[data.current];
}

function scan(lexemes: Lexeme[] | undefined): (ConsolidatedElementLexeme | WhitespaceLexeme)[] {
    if (lexemes === undefined) {
        return [];
    }
    const data: Data = {
        start: 0,
        current: 0,
        lexemes: lexemes,
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
        return finishElementLexeme(data, current);
    }
}

function makeLabelMatchFn(id: ElementId): (lexeme: Lexeme) => boolean {
    return (label) => {
        return label.type === "whitespace" || label.id === id;
    };
}

function excludeId(lexeme: Lexeme): Omit<ElementLexeme, "id"> | WhitespaceLexeme {
    if (lexeme.type === "element") {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...output } = lexeme;
        return output;
    }
    return lexeme;
}

function finishElementLexeme(data: Data, elementLexeme: ElementLexeme): void {
    const matchFn = makeLabelMatchFn(elementLexeme.id);
    while (match(data, matchFn)) {
        // advance
    }
    const { start, current, lexemes, output } = data;
    const peekLabel = peek(data);
    if (peekLabel === "end") {
        output.push({
            type: "element",
            id: elementLexeme.id,
            lexemes: lexemes.slice(start, current).map(excludeId)
        });
    } else {
        output.push({
            type: "element",
            id: elementLexeme.id,
            lexemes: lexemes.slice(start, current - 1).map(excludeId)
        });
        output.push({
            type: "whitespace",
            lexeme: lexemes[current - 1].lexeme
        });
    }
}


export const Utils = {
    scan
};