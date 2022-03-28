import { DerivationTree, DerivationTreeItem, DiagramState } from "@app/utils";
import { ElementType } from "@domain/language";
import { DisplaySettings } from "./types";
import { Utils } from "./utils";

export function getAddMenuElements(diagram: DiagramState, display: DisplaySettings): Exclude<ElementType, "word">[] {
    const output = new Set<Exclude<ElementType, "word">>();
    const visibleElementTypes = new Set(Utils.getLabelData(diagram, display)
        .filter(Utils.isElementLabel)
        .filter(({ id }) => DiagramState.getItem(diagram, id).ref === undefined)
        .map(({ id }) => DiagramState.getItem(diagram, id).type));
    visibleElementTypes.forEach((visibleElementType) => {
        const tree = DerivationTree.getDerivationTree(visibleElementType);
        extractDerivationTreeElements(tree).forEach((element) => output.add(element));
    });
    return Array.from(output);
}

function extractDerivationTreeElements(tree: DerivationTree | undefined): Exclude<ElementType, "word">[] {
    if (tree === undefined) {
        return [];
    }
    const { partOfSpeech, phrase, clause, sentence } = tree;
    const output = new Set<Exclude<ElementType, "word">>();
    if (partOfSpeech !== undefined) {
        partOfSpeech.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    if (phrase !== undefined) {
        phrase.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    if (clause !== undefined) {
        clause.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    if (sentence !== undefined) {
        sentence.forEach((item) => extractElementTypes(item).forEach((element) => output.add(element)));
    }
    return Array.from(output);
}

function extractElementTypes({ primaryType, coordType }: DerivationTreeItem): Exclude<ElementType, "word">[] {
    const output: Exclude<ElementType, "word">[] = [];
    if (primaryType !== undefined) {
        output.push(primaryType.type);
    }
    if (coordType !== undefined) {
        output.push(coordType.type);
    }
    return output;
}