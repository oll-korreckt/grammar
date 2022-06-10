import { createContext } from "react";

export interface InputKeyContext {
    inputKey?: string;
}

export const InputKeyContext = createContext<InputKeyContext>({});

export interface DisplayModeContext {
    displayMode: "full screen" | "partial";
}

export const DisplayModeContext = createContext<DisplayModeContext>({ displayMode: "full screen" });