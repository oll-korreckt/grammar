import { DiagramState } from "@app/utils";
import { ElementCategory, ElementId } from "@domain/language";

export interface Model {
    defaultCategory?: ElementCategory;
    defaultElement?: ElementId;
    diagram: DiagramState;
}