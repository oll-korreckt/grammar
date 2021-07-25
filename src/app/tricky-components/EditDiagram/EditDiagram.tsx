import React, { useContext } from "react";
import { DiagramState, DiagramStateContext, DisplayModelContext, withOnClick, accessClassName, ElementSelectNode, SimpleComponent, DiagramStateItem, DisplayModel, makeRefComponent, useOutsideClick, SimpleComponentProps, SelectedElement, isHeadElementSelectNode, isTailElementSelectNode, ElementDisplayInfo } from "@app/utils";
import { ElementLabel, withHeadLabel, withSideBorder } from "@app/basic-components";
import { ElementReference, getElementDefinition } from "@domain/language";
import styles from "./_styles.scss";

type LabelClickFunction = (node: ElementSelectNode) => void;
type NakedWordClickFunction = () => void;

const NEITHER_PRESENT = 0;
const LEFT_PRESENT = 1 << 0;
const RIGHT_PRESENT = 1 << 1;
const BOTH_PRESENT = LEFT_PRESENT | RIGHT_PRESENT;

function getLexeme(diagram: DiagramState, index: number): string {
    const id = diagram.wordOrder[index];
    return DiagramState.getTypedItem(diagram, "word", id).value.lexeme;
}

function generateLabelBorder(headLabel: string, index: number, positions: number[]): typeof ElementLabel {
    let output = ElementLabel;
    const position = positions[index];

    if (index < positions.length - 1) {
        const rightPosition = positions[index + 1];
        if (rightPosition - position !== 1) {
            output = withSideBorder(output, "right");
        }
    } else if (index === positions.length - 1) {
        output = withSideBorder(output, "right");
    }

    if (index === 0) {
        output = withHeadLabel(output, headLabel);
    } else {
        const leftPosition = positions[index - 1];
        if (position - leftPosition !== 1) {
            output = withSideBorder(output, "left");
        }
    }
    return output;
}

function getElementSelectNodes(item: DiagramStateItem): ElementSelectNode[] {
    if (item.type === "word") {
        throw "cannot display children of word element";
    }
    const output: ElementSelectNode[] = [];
    const itemValue = item.value as unknown as Record<string, undefined | ElementReference | ElementReference[]>;
    const entries = Object.entries(getElementDefinition(item.type));
    for (let i = 0; i < entries.length; i++) {
        const [propertyName] = entries[i];
        const propertyValue = itemValue[propertyName];
        if (propertyValue === undefined) {
            continue;
        } else if (Array.isArray(propertyValue)) {
            propertyValue.forEach(({ id }) => {
                output.push({
                    id: id,
                    property: propertyName,
                    type: item.type
                });
            });
        } else {
            output.push({
                id: propertyValue.id,
                property: propertyName,
                type: item.type
            });
        }
    }
    return output;
}

function addItemLabels(model: DisplayModel, node: ElementSelectNode, labelClick: LabelClickFunction): (SimpleComponent | undefined)[] {
    const output: (SimpleComponent | undefined)[] = model.word.map(() => undefined);
    const positions = model.elements[node.id].words;
    positions.forEach((position, index) => {
        const { header, color } = ElementDisplayInfo.getDisplayInfo(node.type);
        let Label = generateLabelBorder(header, index, positions);
        Label = withOnClick(Label, () => labelClick(node));
        const fnCmp: SimpleComponent = ({ children }) => <Label color={color}>{children}</Label>;
        fnCmp.displayName = Label.displayName;
        output[position] = fnCmp;
    });
    return output;
}

function combineArrays<T>(array1: (T | undefined)[], array2: (T | undefined)[]): (T | undefined)[] {
    if (array1.length !== array2.length) {
        throw `Arrays are of unequal lengths\narray1: ${array1.length}\narray2: ${array2.length}`;
    }
    const output: (T | undefined)[] = [];
    for (let i = 0; i < array1.length; i++) {
        let state = NEITHER_PRESENT;
        const left = array1[i];
        const right = array2[i];
        if (left !== undefined) {
            state |= LEFT_PRESENT;
        }
        if (right !== undefined) {
            state |= RIGHT_PRESENT;
        }
        let item: T | undefined;
        switch (state) {
            case NEITHER_PRESENT:
                item = undefined;
                break;
            case LEFT_PRESENT:
                item = left;
                break;
            case RIGHT_PRESENT:
                item = right;
                break;
            case BOTH_PRESENT:
                throw `array1 and array2 both contain items at index ${i}`;
            default:
                throw `unexpected state at index ${i}`;
        }
        output.push(item);
    }
    return output;
}

function createSelectedLabels(diagram: DiagramState, { displayModel, selectedItem }: DisplayModelContext, labelClick: LabelClickFunction): (SimpleComponent | undefined)[] {
    let output: (SimpleComponent | undefined)[] = diagram.wordOrder.map(() => undefined);
    if (selectedItem === undefined) {
        return output;
    }
    const finalSelectedItem = selectedItem[selectedItem.length - 1];
    const diagramItem = DiagramState.getItem(diagram, finalSelectedItem.id);
    const nodes = getElementSelectNodes(diagramItem);
    nodes.forEach((node) => {
        const labels = addItemLabels(displayModel, node, () => labelClick(node));
        output = combineArrays(output, labels);
    });
    return output;
}

const NakedWord = makeRefComponent<HTMLDivElement, SimpleComponentProps>("NakedWord", ({ children }, ref) => {
    return (
        <div
            className={accessClassName(styles, "nakedWord")}
            ref={ref}
        >
            <span>{children}</span>
        </div>
    );
});

function createTopLabels(diagram: DiagramState, { displayModel, topFilter }: DisplayModelContext, labelClick: LabelClickFunction): (SimpleComponent | undefined)[] {
    let output: (SimpleComponent | undefined)[] = diagram.wordOrder.map(() => undefined);
    if (topFilter === undefined) {
        return output;
    }
    const ids = displayModel[topFilter];
    ids.forEach((id) => {
        const item = DiagramState.getItem(diagram, id);
        const node: ElementSelectNode = {
            id: id,
            type: item.type
        };
        const labels = addItemLabels(displayModel, node, labelClick);
        output = combineArrays(output, labels);
    });
    return output;
}

function createDisplayLabels(diagram: DiagramState, model: DisplayModelContext, labelClick: LabelClickFunction, nakedWordClick: NakedWordClickFunction): SimpleComponent[] {
    const output = model.selectedItem === undefined
        ? createTopLabels(diagram, model, labelClick)
        : createSelectedLabels(diagram, model, labelClick);
    for (let position = 0; position < diagram.wordOrder.length; position++) {
        if (output[position] !== undefined) {
            continue;
        }
        output[position] = withOnClick(NakedWord, nakedWordClick);
    }
    return output as SimpleComponent[];
}

export const EditDiagram: React.VFC = () => {
    const diagram = useContext(DiagramStateContext);
    const model = useContext(DisplayModelContext);
    const state = diagram.state.currState;
    const reset = () => model.setSelectedItem(undefined);
    const ref = useOutsideClick<HTMLDivElement>(reset);

    function labelClickFunction(node: ElementSelectNode) {
        let newSelectedItem: SelectedElement;
        if (model.selectedItem === undefined) {
            if (!isHeadElementSelectNode(node)) {
                throw "";
            }
            newSelectedItem = [node];
        } else {
            if (!isTailElementSelectNode(node)) {
                throw "";
            }
            newSelectedItem = [...model.selectedItem, node];
        }
        model.setSelectedItem(newSelectedItem);
    }

    const items = createDisplayLabels(state, model, labelClickFunction, reset);
    return (
        <div
            className={accessClassName(styles, "editDiagram")}
            ref={ref}
        >
            {state.wordOrder.map((id, index) => {
                const Component = items[index];
                const lexeme = getLexeme(state, index);
                return <Component key={index}>{lexeme}</Component>;
            })}
        </div>
    );
};