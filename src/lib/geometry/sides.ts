import { Point } from ".";
import { Ray } from "./ray";
import { Segment } from "./segment";

function collision(set1: Segment[], set2: Segment[]): boolean {
    for (let i = 0; i < set1.length; i++) {
        const side1 = set1[i];
        for (let j = 0; j < set2.length; j++) {
            const side2 = set2[j];
            if (Segment.collision(side1, side2)) {
                return true;
            }
        }
    }
    return false;
}

function containsPoint(sides: Segment[], point: Point): boolean {
    const offset = Point.init(1, 1);
    const direction = Point.add(point, offset);
    const ray = Ray.init(point, direction);
    let count = 0;
    sides.forEach((side) => {
        if (Ray.collision(ray, side)) {
            count++;
        }
    });
    if (count === 0) {
        throw "error";
    }
    return count % 2 !== 0;
}

export const Sides = {
    collision: collision,
    containsPoint: containsPoint
};