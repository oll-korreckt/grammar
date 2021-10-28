import { Point } from "@lib/geometry";

export interface Hyperparameters {
    coolingFactor: number;
    initialTemperature: number;
    boundary: [Point, Point, Point, Point];
    distancePenalty: number;
    collisionPenalty: number;
    maxStepSize: number;
    quadrantPenalties: [number, number, number, number];
}