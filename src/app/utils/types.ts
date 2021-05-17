import { SimpleObject } from "@lib/utils";

export enum LinkType {
    Target = "target",
    Reference = "reference"
}

export type DiagramState<ValueType extends SimpleObject = SimpleObject> = {
    [key: string]: {
        value: ValueType;
        links: {
            [key: string]: LinkType;
        };
    };
}