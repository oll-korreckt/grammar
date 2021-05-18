import { ElementId } from "./element-id";

export type TokenType = "word" | "whitespace" | "end";

export interface Token {
    lexeme: string;
    tokenType: TokenType;
}

export type PartOfSpeechType = undefined | "noun" | "verb";

export interface WordTag {
    id: ElementId;
    lexeme: string;
    posType?: PartOfSpeechType;
}

export function isWordTag(x: any): x is WordTag {
    if (typeof x === "object"
        && (x as WordTag).lexeme !== undefined) {
        switch ((x as WordTag).posType) {
            case undefined:
            case "noun":
            case "verb":
                return true;
        }
    }
    return false;
}

export interface BlankWordTag extends WordTag {
    posType?: undefined;
}

export function isBlankWordTag(x: any): x is BlankWordTag {
    return isWordTag(x) && x.posType === undefined;
}

export interface NounTag extends WordTag {
    posType: "noun";
    nounType?: "verbSubj" | "verbDirObj" | "verbIndObj";
}

export function isNounTag(x: any): x is NounTag {
    return isWordTag(x) && x.posType === "noun";
}

export interface ReferencedNounTag extends NounTag {
    nounType: Exclude<NounTag["nounType"], undefined>;
    reference?: ElementId;
}

export interface BlankNounTag extends NounTag {
    nounType?: undefined;
}

export interface VerbTag extends WordTag {
    posType: "verb";
    verbSubj?: NounTag;
    verbDirObj?: NounTag;
    verbIndObj?: NounTag;
}

export function isVerbTag(x: any): x is VerbTag {
    return isWordTag(x) && x.posType === "verb";
}
