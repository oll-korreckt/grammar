export type Bounds = [
    bound1: number,
    bound2: number
];

function sort(bounds: Bounds): Bounds {
    const [x1, x2] = bounds;
    return x1 < x2 ? [x1, x2] : [x2, x1];
}

function overlap(bounds1: Bounds, bounds2: Bounds): Bounds | false {
    const sorted1 = sort(bounds1);
    const sorted2 = sort(bounds2);
    const [x1, x2] = sorted1;
    const [y1, y2] = sorted2;
    if (x2 >= y1 && y2 >= x1) {
        const output: Bounds = [
            Math.max(sorted1[0], sorted2[0]),
            Math.min(sorted1[1], sorted2[1])
        ];
        return output;
    }
    return false;
}

export const Bounds = {
    overlap: overlap
};