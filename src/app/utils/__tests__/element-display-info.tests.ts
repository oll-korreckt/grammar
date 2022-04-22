import { ElementType } from "@domain/language";
import { ElementDisplayInfo } from "../element-display-info";
import { assert } from "chai";

function containsRequired(properties: ElementDisplayInfo["properties"][keyof ElementDisplayInfo["properties"]][]): boolean {
    for (let index = 0; index < properties.length; index++) {
        const { displayOrder, required } = properties[index];
        if (displayOrder === 0 && required) {
            return true;
        }
    }
    return false;
}

describe("ElementDisplayInfo", () => {
    describe("getAbbreviatedName", () => {
        test("has abrName", () => {
            const input = { fullName: "Full Name", abrName: "Abbreviated Name" };
            const result = ElementDisplayInfo.getAbbreviatedName(input);
            assert.strictEqual(result, "Abbreviated Name");
        });

        test("no abrName", () => {
            const input = { fullName: "Full Name" };
            const result = ElementDisplayInfo.getAbbreviatedName(input);
            assert.strictEqual(result, "Full Name");
        });
    });

    describe("getDisplayInfo", () => {
        type AllElementTypes = {
            [Key in ElementType]: true;
        };
        let loopObj: AllElementTypes;
        beforeAll(() => {
            loopObj = {
                word: true,
                noun: true,
                pronoun: true,
                verb: true,
                infinitive: true,
                participle: true,
                gerund: true,
                adjective: true,
                adverb: true,
                preposition: true,
                determiner: true,
                coordinator: true,
                subordinator: true,
                interjection: true,
                coordinatedNoun: true,
                coordinatedPronoun: true,
                coordinatedVerb: true,
                coordinatedInfinitive: true,
                coordinatedParticiple: true,
                coordinatedGerund: true,
                coordinatedAdjective: true,
                coordinatedAdverb: true,
                coordinatedPreposition: true,
                coordinatedDeterminer: true,
                nounPhrase: true,
                verbPhrase: true,
                adjectivePhrase: true,
                adverbPhrase: true,
                prepositionPhrase: true,
                gerundPhrase: true,
                infinitivePhrase: true,
                participlePhrase: true,
                coordinatedNounPhrase: true,
                coordinatedVerbPhrase: true,
                coordinatedAdjectivePhrase: true,
                coordinatedAdverbPhrase: true,
                coordinatedPrepositionPhrase: true,
                coordinatedGerundPhrase: true,
                coordinatedInfinitivePhrase: true,
                coordinatedParticiplePhrase: true,
                independentClause: true,
                nounClause: true,
                relativeClause: true,
                adverbialClause: true,
                coordinatedIndependentClause: true,
                coordinatedNounClause: true,
                coordinatedRelativeClause: true,
                coordinatedAdverbialClause: true,
                sentence: true
            };
        });

        test("check display order", () => {
            Object.entries(loopObj).forEach(([type]) => {
                const info = ElementDisplayInfo.getDisplayInfo(type as ElementType);
                const properties = Object.entries(info.properties);
                const result = properties.map(() => false);
                for (let i = 0; i < properties.length; i++) {
                    const doIndex = properties[i][1].displayOrder;
                    result[doIndex] = true;
                }
                const expected = properties.map(() => true);
                assert.deepStrictEqual(result, expected);
            });
        });

        test("contains at least 1 required", () => {
            const types: ElementType[] = Object.entries(loopObj).map(([type]) => type as ElementType);
            for (let index = 0; index < types.length; index++) {
                const type = types[index];
                const info = ElementDisplayInfo.getDisplayInfo(type);
                const properties = Object.entries(info.properties).map((prop) => prop[1]);
                assert.isTrue(
                    containsRequired(properties),
                    `type '${type}' does not have required property`
                );
            }
        });
    });
});