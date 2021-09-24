import { DiagramStateItem } from "@app/utils";
import { ElementReference, ElementType, getElementDefinition } from "@domain/language";

function isOccupied(propValue: ElementReference | ElementReference[] | undefined): boolean {
    return propValue !== undefined && !Array.isArray(propValue);
}

export function getAddProperties(childType: ElementType, item: DiagramStateItem): string[] {
    if (item.type === "word") {
        return [];
    }
    const value = item.value as unknown as Record<string, ElementReference | ElementReference[]>;
    const info = getElementDefinition(item.type);
    const entries = Object.entries(info);
    const output: string[] = [];
    for (let index = 0; index < entries.length; index++) {
        const [key, [, validTypes]] = entries[index];
        const propValue = value[key];
        if (isOccupied(propValue)) {
            continue;
        }
        if (validTypes.includes(childType)) {
            output.push(key);
        }
    }
    return output;
}