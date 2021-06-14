import { ElementType, Identifiable } from "@domain/language";

export type DiagramState = {
    [key: string]: {
        value: Identifiable;
        refs: {
            [key: string]: ElementType;
        };
    };
}
