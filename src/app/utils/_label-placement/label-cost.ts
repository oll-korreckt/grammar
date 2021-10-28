import { Polygon, Segment } from "@lib/geometry";
import { Hyperparameters } from "../label-placement";
import { LabelData } from "./label-data";

export interface LabelCost {
    quadrant?: 0 | 1 | 2| 3;
    distance?: number;
    labelCollisions?: number[];
    targetCollisions?: number[];
}

export type CollisionType = Extract<keyof LabelCost, "labelCollisions" | "targetCollisions">;

function addCollision(cost: LabelCost, type: CollisionType, item: number): void {
    if (cost[type] === undefined) {
        cost[type] = [];
    }
    let collisions = cost[type] as number[];
    collisions = [...collisions, item];
    cost[type] = collisions;
}

function removeCollision(cost: LabelCost, type: CollisionType, item: number): void {
    if (cost[type] === undefined) {
        throw "cannot remove from empty";
    }
    const collisions = cost[type] as number[];
    const output: number[] = [];
    for (let index = 0; index < collisions.length; index++) {
        const element = collisions[index];
        if (element !== item) {
            output.push(element);
        }
    }
    if (output.length === 0) {
        delete cost[type];
    } else {
        cost[type] = output;
    }
}

function updateCost(current: [LabelData, LabelCost], others: [LabelData, LabelCost][]): void {
    const [currentData, currentCost] = current;
    if (currentData.link === undefined) {
        addCollision(currentCost, "targetCollisions", currentData.id);
    } else {
        const link = currentData.link;
        currentCost.distance = Segment.length(link);
        const labelCenter = Polygon.average(currentData.label);
        const targetCenter = Polygon.average(currentData.target);
        const diffX = labelCenter.x - targetCenter.x;
        const diffY = labelCenter.y - targetCenter.y;
        currentCost.quadrant = diffY > 0
            ? diffX > 0 ? 0 : 1
            : diffX > 0 ? 3 : 2;
    }
    others.forEach(([otherData, otherCost]) => {
        if (Polygon.collision(currentData.label, otherData.target)) {
            addCollision(currentCost, "targetCollisions", otherData.id);
        }
        if (Polygon.collision(currentData.label, otherData.label)) {
            addCollision(currentCost, "labelCollisions", otherData.id);
            addCollision(otherCost, "labelCollisions", currentData.id);
        }
    });
}

function calcCost(cost: LabelCost, hParams: Hyperparameters): number {
    const { distance, labelCollisions, targetCollisions, quadrant } = cost;
    const { collisionPenalty, distancePenalty, quadrantPenalties } = hParams;
    let output = 0;
    if (distance !== undefined) {
        output += distance * distancePenalty;
    }
    if (targetCollisions !== undefined) {
        output += targetCollisions.length * collisionPenalty;
    }
    if (labelCollisions !== undefined) {
        output += labelCollisions.length * collisionPenalty / 2;
    }
    if (quadrant !== undefined) {
        output += quadrantPenalties[quadrant];
    }
    return output;
}

export const LabelCost = {
    updateCost: updateCost,
    calcCost: calcCost
};