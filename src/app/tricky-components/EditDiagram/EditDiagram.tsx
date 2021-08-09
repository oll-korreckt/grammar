import React, { useContext } from "react";
import { DiagramState, DiagramStateContext, DisplayModel, DisplayModelContext, ElementCategory, ElementDisplayInfo, ElementSelectState, SelectedElement, WordIndices, WordRange } from "@app/utils";
import { ElementId, ElementType } from "@domain/language";
import { HeadLabel, Space, WordLabel, Word } from "@app/basic-components/Word";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";

function getLexemes(diagram: DiagramState, index: WordIndices[number]): string[] {
    return (Array.isArray(index) ? WordRange.expand(index) : [index])
        .map((wIndex) => diagram.wordOrder[wIndex])
        .map((id) => DiagramState.getTypedItem(diagram, "word", id).value.lexeme);
}

function _placeElementData(data: ElementData, output: (ElementData | undefined)[]): void {
    if (Array.isArray(data.index)) {
        const [startIndex, endIndex] = data.index;
        output[startIndex] = data;
        for (let index = startIndex + 1; index < endIndex + 1; index++) {
            output[index] = undefined;
        }
    } else {
        output[data.index] = data;
    }
}

function _getElementData(diagram: DiagramState, model: DisplayModel, id: ElementId): ElementData[] {
    const output: ElementData[] = [];
    const elementType = DiagramState.getItem(diagram, id).type;
    const element = model[id];
    const headWIndex = element.words[0];
    const headData: ElementData = {
        head: true,
        selected: false,
        id: id,
        key: `${id}-0`,
        lexemes: getLexemes(diagram, headWIndex),
        type: elementType,
        index: headWIndex
    };
    output.push(headData);
    for (let i = 1; i < element.words.length; i++) {
        const tailWIndex = element.words[i];
        const tailData: ElementData = {
            head: false,
            selected: false,
            id: id,
            key: `${id}-${i}`,
            lexemes: getLexemes(diagram, tailWIndex),
            type: elementType,
            index: tailWIndex
        };
        output.push(tailData);
    }
    return output;
}

function _populate(diagram: DiagramState, model: DisplayModel, id: ElementId, selectState: ElementSelectState | undefined, output: (ElementData | undefined)[]): void {
    switch (selectState) {
        case "select":
            _populateSelected(diagram, model, id, output);
            break;
        case "expand":
            _populateExpanded(diagram, model, id, output);
            break;
        case undefined:
            _getElementData(diagram, model, id).forEach((data) => _placeElementData(data, output));
            break;
        default:
            throw " ";
    }
}

function _populateExpanded(diagram: DiagramState, displayModel: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    const displayElement = displayModel[id];
    if (displayElement.properties === undefined) {
        throw "";
    }
    Object.values(displayElement.properties)
        .flat()
        .forEach((childId) => _populate(diagram, displayModel, childId, undefined, output));
}

function _populateSelected(diagram: DiagramState, displayModel: DisplayModel, id: ElementId, output: (ElementData | undefined)[]): void {
    _getElementData(diagram, displayModel, id)
        .map((data) => { return { ...data, selected: true }; })
        .forEach((data) => _placeElementData(data, output));
}

function _selectedItem(diagram: DiagramState, displayModel: DisplayModel, selectedItem: SelectedElement | undefined, output: (ElementData | undefined)[]): void {
    if (selectedItem === undefined) {
        return;
    }
    const lastItem = selectedItem[selectedItem.length - 1];
    _populate(diagram, displayModel, lastItem.id, lastItem.state, output);
    for (let index = selectedItem.length - 2; index >= 0; index--) {
        const itemId = selectedItem[index].id;
        const childId = selectedItem[index + 1].id;
        const item = displayModel[itemId];
        if (item.properties === undefined) {
            throw "";
        }
        Object.values(item.properties)
            .flat()
            .filter((id) => id !== childId)
            .forEach((id) => _populate(diagram, displayModel, id, undefined, output));
    }
}

function _elementFilter(diagram: DiagramState, displayModel: DisplayModel, elementFilter: ElementCategory, output: (ElementData | undefined)[]): void {
    Object.entries(displayModel)
        .filter(([, { category, ref }]) => {
            return category === elementFilter
                && ref !== undefined
                && displayModel[ref].category !== category;
        })
        .forEach(([id]) => _populate(diagram, displayModel, id, undefined, output));
}

function _fillOutput(diagram: DiagramState, displayModel: DisplayModel, output: (ElementData | undefined)[]): void {
    let index = 0;
    while (index < output.length) {
        const data = output[index];
        if (data === undefined) {
            const id = diagram.wordOrder[index];
            _populate(diagram, displayModel, id, undefined, output);
            index++;
        } else {
            let jumpCnt = 1;
            if (Array.isArray(data.index)) {
                const [startIndex, endIndex] = data.index;
                jumpCnt = endIndex - startIndex + 1;
            }
            index += jumpCnt;
        }
    }
}

function getElementData(diagram: DiagramState, displayModel: DisplayModel, elementFilter: ElementCategory | undefined, selectedItem: SelectedElement | undefined): ElementData[] {
    const output: (ElementData | undefined)[] = diagram.wordOrder.map(() => undefined);
    _elementFilter(
        diagram,
        displayModel,
        elementFilter === undefined ? "word" : elementFilter,
        output
    );
    _selectedItem(diagram, displayModel, selectedItem, output);
    _fillOutput(diagram, displayModel, output);

    return output.filter((x) => x !== undefined) as ElementData[];
}

export type ElementData = {
    head: boolean;
    id: ElementId;
    key: string;
    type: ElementType;
    lexemes: string[];
    selected: boolean;
    index: WordIndices[number];
}

export interface EditDiagramProps {
    elementBuildFn?: (Component: RefComponent<HTMLSpanElement>, data: ElementData) => RefComponent<HTMLSpanElement>;
}

function withSpace(Component: RefComponent<HTMLSpanElement>): RefComponent<HTMLSpanElement> {
    return makeRefComponent("withSpace", (_, ref) => (
        <>
            <Component ref={ref}/>
            <Space/>
        </>
    ));
}

export const EditDiagram = makeRefComponent<HTMLDivElement, EditDiagramProps>("EditDiagram", ({ elementBuildFn }, ref) => {
    const diagram = useContext(DiagramStateContext);
    const model = useContext(DisplayModelContext);
    const elementData = getElementData(
        diagram.state.currState,
        diagram.model,
        model.elementFilter,
        model.selectedItem
    );

    function createElement(data: ElementData): RefComponent<HTMLSpanElement> {
        const displayInfo = ElementDisplayInfo.getDisplayInfo(data.type);
        const output = makeRefComponent<HTMLSpanElement>("", (_0, ref0) => (
            <WordLabel color={displayInfo.color} ref={ref0}>
                {data.lexemes.map((lexeme, index) => {
                    const key = `${data.key}-${index}`;
                    let Component = makeRefComponent<HTMLSpanElement>("", (_1, ref1) => (
                        <Word ref={ref1}>
                            {(data.head && index === 0) &&
                                <HeadLabel>{displayInfo.header}</HeadLabel>
                            }
                            {lexeme}
                        </Word>
                    ));
                    Component.displayName = key;
                    if (index < data.lexemes.length - 1) {
                        Component = withSpace(Component);
                    }
                    return <Component key={key}/>;
                })}
            </WordLabel>
        ));
        return elementBuildFn ? elementBuildFn(output, data) : output;
    }

    return (
        <div ref={ref}>
            {elementData.map((data, index) => {
                let Component = createElement(data);
                if (index < elementData.length - 1) {
                    Component = withSpace(Component);
                }
                return <Component key={data.key}/>;
            })}
        </div>
    );
});