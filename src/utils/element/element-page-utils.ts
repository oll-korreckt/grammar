import { ElementCategory, ElementType, elementTypeLists } from "@domain/language";
import { HTMLUnorderedListObject } from "@lib/utils";


function _getCategoryList(category: Exclude<ElementCategory, "word">): HTMLUnorderedListObject {
    let items: ElementType[];
    switch (category) {
        case "partOfSpeech":
            items = elementTypeLists.partOfSpeech;
            break;
        case "phrase":
            items = elementTypeLists.phrase;
            break;
        case "clause":
            items = elementTypeLists.clause;
            break;
        case "sentence":
            items = ["sentence"];
    }
    return {
        type: "ul",
        custom: category,
        items: items.map((item) => {
            return {
                type: "li",
                custom: item,
                content: item
            };
        })
    };
}

function _getFullCategoryList(): HTMLUnorderedListObject {
    return {
        type: "ul",
        custom: "category-list",
        items: [
            {
                type: "li",
                custom: "word",
                content: "Words"
            },
            {
                type: "li",
                custom: "coordinated",
                content: "Coordinated Elements"
            },
            {
                type: "li",
                custom: "partOfSpeech",
                content: [
                    "Categories",
                    _getCategoryList("partOfSpeech")
                ]
            },
            {
                type: "li",
                custom: "phrase",
                content: [
                    "Phrases",
                    _getCategoryList("phrase")
                ]
            },
            {
                type: "li",
                custom: "clause",
                content: [
                    "Clauses",
                    _getCategoryList("clause")
                ]
            }
        ]
    };
}

function getCategoryList(category?: Exclude<ElementCategory, "word"> | undefined): HTMLUnorderedListObject {
    return category === undefined
        ? _getFullCategoryList()
        : _getCategoryList(category);
}


export const ElementPageUtils = {
    getCategoryList: getCategoryList
};