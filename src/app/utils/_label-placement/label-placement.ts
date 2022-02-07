import { Point, Polygon } from "@lib/geometry";
import { Hyperparameters } from "./types";
import { LabelCost } from "./label-cost";
import { LabelData } from "./label-data";

interface Boundaries {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}

type State = [LabelData, LabelCost][];

function run(labels: Point[][], targets: Point[][], hParams: Hyperparameters): Point[][] {
    console.log(targets);
    let currentState = init(labels, targets);
    let [currentCost, worstLabel] = calcCost(currentState, hParams);
    let temperature = 0.91;
    const maxIsotherms = 50;
    const maxIsothermIterations = labels.length * 20;
    const maxIsothermChanges = labels.length * 5;
    const steps = [currentCost];
    for (let isotherm = 0; isotherm < maxIsotherms; isotherm++) {
        let isothermChanges = 0;
        for (let isothermIteration = 0; isothermIteration < maxIsothermIterations; isothermIteration++) {
            const newState = moveLabel(currentState, worstLabel, hParams);
            const [newCost, newWorstLabel] = calcCost(newState, hParams);
            const deltaCost = newCost - currentCost;
            if (deltaCost < 0 || acceptWorse(temperature, deltaCost)) {
                currentState = newState;
                currentCost = newCost;
                worstLabel = newWorstLabel;
                isothermChanges++;
            }
            steps.push(currentCost);
            if (isothermChanges > maxIsothermChanges) {
                break;
            }
        }
        temperature *= hParams.coolingFactor;
        if (isothermChanges === 0) {
            break;
        }
    }
    return currentState.map(([{ label }]) => label);
}

function acceptWorse(temperature: number, deltaCost: number): boolean {
    const acceptProbability = Math.exp(-deltaCost / temperature);
    const randomValue = Math.random();
    const output = randomValue < acceptProbability;
    return output;
}

function init(labels: Point[][], targets: Point[][]): State {
    if (labels.length !== targets.length) {
        throw "the number of labels and targets must be equal";
    }
    const output: State = [];
    for (let index = 0; index < labels.length; index++) {
        const label = labels[index];
        const target = targets[index];
        output.push([
            LabelData.init(index, label, target),
            {}
        ]);
    }
    for (let currentIndex = 0; currentIndex < output.length; currentIndex++) {
        const current = output[currentIndex];
        const others = output.slice(currentIndex + 1);
        LabelCost.updateCost(current, others);
    }
    return output;
}

function calcCost(state: State, hParams: Hyperparameters): [cost: number, worst: number] {
    let worstCost = LabelCost.calcCost(state[0][1], hParams);
    let worstIndex = 0;
    let totalCost = worstCost;
    for (let index = 1; index < state.length; index++) {
        const [, cost] = state[index];
        const itemCost = LabelCost.calcCost(cost, hParams);
        totalCost += itemCost;
        if (itemCost > worstCost) {
            worstCost = itemCost;
            worstIndex = index;
        }
    }
    return [totalCost, worstIndex];
}

function randomInt(min: number, max: number): number {
    if (max < min) {
        throw `max bound: ${max} is less than the min bound: ${min}`;
    }
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function moveLabel(state: State, index: number, hParams: Hyperparameters): State {
    const output: State = [];
    const others: State = [];
    for (let i = 0; i < state.length; i++) {
        const [data, cost] = state[i];
        const copyItem: State[number] = [{ ...data }, { ...cost }];
        output.push(copyItem);
        if (i !== index) {
            others.push(copyItem);
        }
    }

    const [{ label, target }] = output[index];
    const { upperX, lowerX, upperY, lowerY } = getMoveBounds(label, hParams);
    const moveX = randomInt(lowerX, upperX);
    const moveY = randomInt(lowerY, upperY);

    const movedLabel = Polygon.translateLinear(label, moveX, moveY);
    const newData = LabelData.init(index, movedLabel, target);
    const newItem: State[number] = [newData, {}];
    LabelCost.updateCost(newItem, others);
    output[index] = newItem;
    return output;
}

export interface MoveBounds {
    lowerX: number;
    upperX: number;
    lowerY: number;
    upperY: number;
}

function getMoveBounds(label: Point[], hParams: Pick<Hyperparameters, "boundary" | "maxStepSize">): MoveBounds {
    const { boundary, maxStepSize } = hParams;
    const labelBounds = getBounds(label);
    const bounds = getBounds(boundary);
    const maxX = bounds.maxX - labelBounds.maxX;
    const minX = bounds.minX - labelBounds.minX;
    const maxY = bounds.maxY - labelBounds.maxY;
    const minY = bounds.minY - labelBounds.minY;
    const lowerX = Math.max(minX, -maxStepSize);
    const upperX = Math.min(maxX, maxStepSize);
    const upperY = Math.min(maxY, maxStepSize);
    const lowerY = Math.max(minY, -maxStepSize);
    return { lowerX, upperX, lowerY, upperY };
}

function getBounds(label: Point[]): Boundaries {
    let { x, y } = label[0];
    let minX = x;
    let maxX = x;
    let minY = y;
    let maxY = y;
    for (let index = 1; index < label.length; index++) {
        ({ x, y } = label[index]);
        if (x < minX) {
            minX = x;
        }
        if (x > maxX) {
            maxX = x;
        }
        if (y < minY) {
            minY = y;
        }
        if (y > maxY) {
            maxY = y;
        }
    }
    return {
        minX: minX,
        maxX: maxX,
        minY: minY,
        maxY: maxY
    };
}

export const LabelPlacement = {
    run: run
};

export const SubFunctions = {
    getMoveBounds: getMoveBounds,
    randomInt: randomInt,
    acceptWorse: acceptWorse
};