export type ElementId = string;

function createWordId(position: number): ElementId {
    return `1.${position}`;
}

export const ElementId = {
    createWordId
};