import { createContext } from "react";

export interface InputKeyContext {
    inputKey?: string;
}

export const InputKeyContext = createContext<InputKeyContext>({});