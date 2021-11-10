import { AnimatePresence, AnimateSharedLayout } from "framer-motion";
import React, { createContext, useEffect, useState } from "react";
import { FadeContainer } from "./FadeContainer";

export interface FadeSwitchProps {
    transportId?: string;
    activeChild?: number;
    duration?: number;
    children: React.ReactChild[];
}

export interface FadeSwitchContext {
    transportId?: string;
    duration: number;
    firstMount: boolean;
}

const DEFAULT_DURATION = 0.5;

export const FadeSwitchContext = createContext<FadeSwitchContext>({
    duration: DEFAULT_DURATION,
    firstMount: true
});


export const FadeSwitch: React.FC<FadeSwitchProps> = ({ transportId, activeChild, duration, children }) => {
    const definedDuration = duration !== undefined ? duration : DEFAULT_DURATION;
    const definedActiveChild = activeChild !== undefined ? activeChild : 0;
    const [index, setIndex] = useState(definedActiveChild);
    const [firstMount, setFirstMount] = useState(true);

    useEffect(() => {
        setIndex(definedActiveChild);
    }, [definedActiveChild]);

    useEffect(() => setFirstMount(false), []);

    return (
        <FadeSwitchContext.Provider
            value={{
                transportId,
                firstMount,
                duration: definedDuration
            }}
        >
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence
                    initial={false}
                >
                    <FadeContainer key={index}>
                        {children[index]}
                    </FadeContainer>
                </AnimatePresence>
            </AnimateSharedLayout>
        </FadeSwitchContext.Provider>
    );
};