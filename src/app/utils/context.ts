import { createContext } from "react";

export interface DisplayModeContext {
    displayMode: "full screen" | "partial";
}

export const DisplayModeContext = createContext<DisplayModeContext>({ displayMode: "full screen" });

export interface ControlAnimationContext {
    activeElement?: string;
}

export const ControlAnimationContext = createContext<ControlAnimationContext>({});

export const ControlAnimationUtils = {
    isActive(controlId: string | undefined, activeId: string | undefined): boolean {
        return controlId !== undefined && activeId === controlId;
    }
};

export interface AnimationIdBuilderContext {
    idBase?: string;
}

export const AnimationIdBuilderContext = createContext<AnimationIdBuilderContext>({});

export const AnimationIdBuilderUtils = {
    extendId(base: string | undefined, ...extensions: string[]): string | undefined {
        if (base === undefined) {
            return undefined;
        }
        let output = base;
        extensions.forEach((ext) => output += "." + ext);
        return output;
    }
};

export interface ClickListenerContext {
    onElementClick?: (id: string | undefined) => void;
}

export const ClickListenerContext = createContext<ClickListenerContext>({});