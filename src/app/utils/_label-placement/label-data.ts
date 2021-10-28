import { Point, Polygon, Segment } from "@lib/geometry";


export interface LabelData {
    id: number;
    label: Point[];
    link?: Segment;
    target: Point[];
}

function init(id: number, label: Point[], target: Point[]): LabelData {
    const output: LabelData = {
        id: id,
        label: label,
        target: target
    };
    if (!Polygon.collision(label, target)) {
        output.link = Polygon.pathToPolygon(label, target);
    }
    return output;
}

export const LabelData = {
    init: init
};