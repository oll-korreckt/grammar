import { ElementDefinitionMapper, ElementType, PartOfSpeechType } from "@domain/language";
import { PhraseType } from "@domain/language/_types/utils";
import { Colors } from "./styles";

function createCoordinated<T extends Exclude<ElementType, "word">>(elementInfo: TypedElementDisplayInfo<T>): CoordinatedElementDisplayInfo {
    return {
        fullName: `Coordinated ${elementInfo.fullName}`,
        abrName: `Coord. ${elementInfo.abrName !== undefined ? elementInfo.abrName : elementInfo.fullName}`,
        header: `C${elementInfo.header}`,
        color: elementInfo.color,
        properties: {
            coordinator: {
                fullName: "Coordinator",
                abrName: "Coord.",
                displayOrder: 0,
                required: true
            },
            items: {
                fullName: "Items",
                displayOrder: 1,
                required: true
            }
        }
    };
}

function createPhrase<T extends PartOfSpeechType & PhraseType>(elementInfo: TypedElementDisplayInfo<T>, properties: TypedElementDisplayInfo<`${T}Phrase`>["properties"]): TypedElementDisplayInfo<`${T}Phrase`> {
    return {
        fullName: `${elementInfo.fullName} Phrase`,
        abrName: `${elementInfo.abrName !== undefined ? elementInfo.abrName : elementInfo.fullName} Phrase`,
        header: `${elementInfo.header}P`,
        color: elementInfo.color,
        properties: properties
    };
}

function modifier(displayOrder: number): { fullName: string; displayOrder: number; } {
    return {
        fullName: "Modifier",
        displayOrder: displayOrder
    };
}

function modifiers(displayOrder: number): { fullName: string; displayOrder: number; } {
    return {
        fullName: "Modifiers",
        displayOrder: displayOrder
    };
}

export type ElementDisplayInfo = {
    fullName: string;
    abrName?: string;
    header: string;
    color: Colors;
    properties: {
        [Key: string]: {
            fullName: string;
            abrName?: string;
            displayOrder: number;
            required?: boolean;
        };
    };
}

type CoordinatedElementDisplayInfo = {
    fullName: string;
    abrName: string;
    header: string;
    color: Colors;
    properties: {
        coordinator: {
            fullName: "Coordinator";
            abrName: "Coord.";
            displayOrder: 0;
            required: true;
        };
        items: {
            fullName: "Items";
            displayOrder: 1;
            required: true;
        };
    };
}

type TypedElementDisplayInfo<T extends Exclude<ElementType, "word">> = {
    fullName: string;
    abrName?: string;
    header: string;
    color: Colors;
    properties: {
        [Key in keyof ElementDefinitionMapper<T>]: {
            fullName: string;
            abrName?: string;
            displayOrder: number;
            required?: boolean;
        };
    };
}

function getAbbreviatedName(typeInfo: { fullName: string; abrName?: string; }): string {
    return typeInfo.abrName !== undefined ? typeInfo.abrName : typeInfo.fullName;
}

function getDisplayInfo(type: ElementType): ElementDisplayInfo {
    if (type === "word") {
        return {
            fullName: "Word",
            header: "W",
            color: "color10",
            properties: {
                lexeme: {
                    fullName: "Lexeme",
                    displayOrder: 0,
                    required: true
                }
            }
        };
    }
    type OutputType = {
        [Key in Exclude<ElementType, "word">]: TypedElementDisplayInfo<Key>;
    }
    const word = {
        word: {
            fullName: "Word",
            displayOrder: 0,
            required: true
        }
    };
    const words = {
        words: {
            fullName: "Words",
            displayOrder: 0,
            required: true
        }
    };
    const verbProps = {
        mainVerb: {
            fullName: "Main Verb",
            displayOrder: 0,
            required: true
        },
        auxiliaryVerbs: {
            fullName: "Auxiliary Verbs",
            abrName: "Aux. Verbs",
            displayOrder: 1
        }
    };
    const noun: TypedElementDisplayInfo<"noun"> = {
        fullName: "Noun",
        header: "N",
        properties: words,
        color: "color1"
    };
    const pronoun: TypedElementDisplayInfo<"pronoun"> = {
        fullName: "Pronoun",
        header: "P",
        properties: words,
        color: "color2"
    };
    const verb: TypedElementDisplayInfo<"verb"> = {
        fullName: "Verb",
        header: "V",
        color: "color3",
        properties: verbProps
    };
    const infinitive: TypedElementDisplayInfo<"infinitive"> = {
        fullName: "Infinitive",
        abrName: "Inf.",
        header: "I",
        color: "color4",
        properties: {
            to: {
                fullName: "To",
                displayOrder: 0,
                required: true
            },
            verb: {
                fullName: "Verb",
                displayOrder: 1,
                required: true
            }
        }
    };
    const participle: TypedElementDisplayInfo<"participle"> = {
        fullName: "Participle",
        abrName: "Part.",
        header: "P",
        color: "color5",
        properties: verbProps
    };
    const gerund: TypedElementDisplayInfo<"gerund"> = {
        fullName: "Gerund",
        header: "G",
        color: "color6",
        properties: word
    };
    const adjective: TypedElementDisplayInfo<"adjective"> = {
        fullName: "Adjective",
        abrName: "Adj.",
        header: "A",
        color: "color7",
        properties: words
    };
    const adverb: TypedElementDisplayInfo<"adverb"> = {
        fullName: "Adverb",
        abrName: "Adv.",
        header: "A",
        color: "color8",
        properties: word
    };
    const preposition: TypedElementDisplayInfo<"preposition"> = {
        fullName: "Preposition",
        abrName: "Prep.",
        header: "P",
        color: "color9",
        properties: words
    };
    const determiner: TypedElementDisplayInfo<"determiner"> = {
        fullName: "Determiner",
        abrName: "Det.",
        header: "D",
        color: "color10",
        properties: words
    };
    const coordinator: TypedElementDisplayInfo<"coordinator"> = {
        fullName: "Coordinator",
        abrName: "Coord.",
        header: "C",
        color: "color11",
        properties: words
    };
    const subordinator: TypedElementDisplayInfo<"subordinator"> = {
        fullName: "Subordinator",
        abrName: "Sub.",
        header: "S",
        color: "color12",
        properties: words
    };
    const interjection: TypedElementDisplayInfo<"interjection"> = {
        fullName: "Interjection",
        abrName: "Int.",
        header: "I",
        color: "color13",
        properties: words
    };
    const head = {
        fullName: "Head",
        displayOrder: 0,
        required: true
    };
    const nounPhrase = createPhrase(
        noun,
        {
            head: head,
            modifiers: modifiers(1)
        }
    );
    const verblikePhraseProps = {
        head: head,
        phrasal: {
            fullName: "Phrasal",
            abrName: "Phrasal",
            displayOrder: 1
        },
        modifiers: {
            fullName: "Modifiers",
            displayOrder: 2
        },
        subjCompl: {
            fullName: "Subject Complement",
            abrName: "Subj. Compl.",
            displayOrder: 3
        },
        dirObj: {
            fullName: "Direct Object",
            abrName: "Dir. Obj.",
            displayOrder: 4
        },
        dirObjCompl: {
            fullName: "Direct Object Complement",
            abrName: "Dir. Obj. Compl.",
            displayOrder: 5
        },
        indObj: {
            fullName: "Indirect Object",
            abrName: "Ind. Obj.",
            displayOrder: 6
        }
    };
    const partPhraseProps: Omit<typeof verblikePhraseProps, "dirObjCompl"> = {
        ...verblikePhraseProps,
        indObj: {
            ...verblikePhraseProps.indObj,
            displayOrder: 5
        }
    };
    delete (partPhraseProps as any).dirObjCompl;
    const verbPhrase = createPhrase(verb, verblikePhraseProps);
    const adjectivePhrase = createPhrase(
        adjective,
        {
            head: head,
            determiner: {
                fullName: "Determiner",
                abrName: "Det.",
                displayOrder: 1
            },
            modifiers: modifiers(2),
            complement: {
                fullName: "Complement",
                abrName: "Compl.",
                displayOrder: 3
            }
        }
    );
    const adverbPhrase = createPhrase(
        adverb,
        {
            head: head,
            modifier: modifier(1)
        }
    );
    const prepositionPhrase = createPhrase(
        preposition,
        {
            head: head,
            object: {
                fullName: "Object",
                abrName: "Obj.",
                displayOrder: 1,
                required: true
            }
        }
    );
    const gerundPhrase = createPhrase(gerund, verblikePhraseProps);
    const infinitivePhrase = createPhrase(infinitive, verblikePhraseProps);
    const participlePhrase = createPhrase(participle, partPhraseProps);
    const indClauseProps = {
        subject: {
            fullName: "Subject",
            abrName: "Subj.",
            displayOrder: 0,
            required: false
        },
        predicate: {
            fullName: "Predicate",
            abrName: "Pred.",
            displayOrder: 1,
            required: true
        }
    };
    const depClauseProps = {
        dependentWord: {
            fullName: "Dependent Word",
            abrName: "Dep. Word",
            displayOrder: 0,
            required: true
        },
        ...{
            subject: {
                ...indClauseProps.subject,
                required: true,
                displayOrder: 1
            },
            predicate: {
                ...indClauseProps.predicate,
                displayOrder: 2
            }
        }
    };
    const independentClause: TypedElementDisplayInfo<"independentClause"> = {
        fullName: "Independent Clause",
        abrName: "Ind. Clause",
        header: "IC",
        color: "color11",
        properties: indClauseProps
    };
    const nounClause: TypedElementDisplayInfo<"nounClause"> = {
        fullName: "Noun Clause",
        header: "NC",
        color: "color1",
        properties: depClauseProps
    };
    const relativeClause: TypedElementDisplayInfo<"relativeClause"> = {
        fullName: "Relative Clause",
        abrName: "Rel. Clause",
        header: "RC",
        color: "color7",
        properties: depClauseProps
    };
    const adverbialClause: TypedElementDisplayInfo<"adverbialClause"> = {
        fullName: "Adverbial Clause",
        abrName: "Adv. Clause",
        header: "AC",
        color: "color8",
        properties: depClauseProps
    };
    const sentence: TypedElementDisplayInfo<"sentence"> = {
        fullName: "Sentence",
        abrName: "Sent.",
        header: "S",
        color: "color10",
        properties: {
            items: {
                fullName: "Items",
                displayOrder: 0,
                required: true
            }
        }
    };
    const output: OutputType = {
        noun: noun,
        pronoun: pronoun,
        verb: verb,
        infinitive: infinitive,
        participle: participle,
        gerund: gerund,
        adjective: adjective,
        adverb: adverb,
        preposition: preposition,
        determiner: determiner,
        coordinator: coordinator,
        subordinator: subordinator,
        interjection: interjection,
        coordinatedNoun: createCoordinated(noun),
        coordinatedPronoun: createCoordinated(pronoun),
        coordinatedVerb: createCoordinated(verb),
        coordinatedInfinitive: createCoordinated(infinitive),
        coordinatedParticiple: createCoordinated(participle),
        coordinatedGerund: createCoordinated(gerund),
        coordinatedAdjective: createCoordinated(adjective),
        coordinatedAdverb: createCoordinated(adverb),
        coordinatedPreposition: createCoordinated(preposition),
        coordinatedDeterminer: createCoordinated(determiner),
        nounPhrase: nounPhrase,
        verbPhrase: verbPhrase,
        adjectivePhrase: adjectivePhrase,
        adverbPhrase: adverbPhrase,
        prepositionPhrase: prepositionPhrase,
        gerundPhrase: gerundPhrase,
        infinitivePhrase: infinitivePhrase,
        participlePhrase: participlePhrase,
        coordinatedNounPhrase: createCoordinated(nounPhrase),
        coordinatedVerbPhrase: createCoordinated(verbPhrase),
        coordinatedAdjectivePhrase: createCoordinated(adjectivePhrase),
        coordinatedAdverbPhrase: createCoordinated(adverbPhrase),
        coordinatedPrepositionPhrase: createCoordinated(prepositionPhrase),
        coordinatedGerundPhrase: createCoordinated(gerundPhrase),
        coordinatedInfinitivePhrase: createCoordinated(infinitivePhrase),
        coordinatedParticiplePhrase: createCoordinated(participlePhrase),
        independentClause: independentClause,
        nounClause: nounClause,
        relativeClause: relativeClause,
        adverbialClause: adverbialClause,
        coordinatedIndependentClause: createCoordinated(independentClause),
        coordinatedNounClause: createCoordinated(nounClause),
        coordinatedRelativeClause: createCoordinated(relativeClause),
        coordinatedAdverbialClause: createCoordinated(adverbialClause),
        sentence: sentence
    };
    return output[type];
}

function getPrimaryProperty(type: ElementType): string;
function getPrimaryProperty(info: ElementDisplayInfo): string;
function getPrimaryProperty(data: ElementType | ElementDisplayInfo): string {
    const { properties }: ElementDisplayInfo = typeof data === "object" ? data : getDisplayInfo(data);
    const entries = Object.entries(properties);
    for (let index = 0; index < entries.length; index++) {
        const [property, { displayOrder }] = entries[index];
        if (displayOrder === 0) {
            return property;
        }
    }
    throw "primary property not found";
}

export const ElementDisplayInfo = {
    getPrimaryProperty: getPrimaryProperty,
    getDisplayInfo: getDisplayInfo,
    getAbbreviatedName: getAbbreviatedName
};