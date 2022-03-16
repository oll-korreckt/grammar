import { ElementCategory, ElementType, elementTypeLists } from "@domain/language";
import { HTMLListItemObject, HTMLUnorderedListObject } from "@lib/utils";
import { ElementPage, ElementPageType, ElementPageType_ElementCategory } from "./types";


function _toList(items: ElementPageType[]): HTMLUnorderedListObject {
    const content: HTMLListItemObject[] = items.map((item) => {
        return {
            type: "li",
            content: ElementPage.createTypeLink(item)
        };
    });
    return {
        type: "ul",
        items: content
    };
}

function _getCoordinableElements(elements: ElementType[]): ElementPageType[] {
    return elements.filter((element) => {
        return ElementPage.isPageType(element) && ElementCategory.isCoordinable(element);
    }) as ElementPageType[];
}

function _getPageTypeElements(category: ElementCategory): ElementPageType[] {
    const output: ElementPageType[] = [];
    for (let index = 0; index < elementTypeLists.element.length; index++) {
        const item = elementTypeLists.element[index];
        if (ElementPage.isPageType(item)
            && ElementCategory.getElementCategory(item) === category) {
            output.push(item);
        }
    }
    return output;
}

function _getCoordinatedCategoryList(): HTMLUnorderedListObject {
    const coordinablePartsOfSpeech = _getCoordinableElements(elementTypeLists.partOfSpeech);
    const coordinablePhrase = _getCoordinableElements(elementTypeLists.phrase);
    const coordinableClause = _getCoordinableElements(elementTypeLists.clause);
    const partOfSpeechList = _toList(coordinablePartsOfSpeech);
    const phraseList = _toList(coordinablePhrase);
    const clauseList = _toList(coordinableClause);
    return {
        type: "ul",
        items: [
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("partOfSpeech"),
                    partOfSpeechList
                ]
            },
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("phrase"),
                    phraseList
                ]
            },
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("clause"),
                    clauseList
                ]
            }
        ]
    };
}

function _getFullCategoryList(): HTMLUnorderedListObject {
    return {
        type: "ul",
        items: [
            { type: "li", content: ElementPage.createTypeLink("word") },
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("partOfSpeech"),
                    _toList(_getPageTypeElements("partOfSpeech"))
                ]
            },
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("phrase"),
                    _toList(_getPageTypeElements("phrase"))
                ]
            },
            {
                type: "li",
                content: [
                    ElementPage.createTypeLink("clause"),
                    _toList(_getPageTypeElements("clause"))
                ]
            },
            { type: "li", content: ElementPage.createTypeLink("coordinated") }
        ]
    };
}

function _getSpecificCategoryList(category: Exclude<ElementPageType_ElementCategory, "word" | "coordinated">): HTMLUnorderedListObject {
    return _toList(_getPageTypeElements(category));
}

function getCategoryList(category?: Exclude<ElementPageType_ElementCategory, "word">): HTMLUnorderedListObject {
    if (category === undefined) {
        return _getFullCategoryList();
    } else if (category === "coordinated") {
        return _getCoordinatedCategoryList();
    } else {
        return _getSpecificCategoryList(category);
    }
}

export const CategoryList = {
    getCategoryList: getCategoryList
};