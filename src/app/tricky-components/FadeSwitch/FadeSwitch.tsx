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
    fadeActive: boolean;
    activeChild: number;
    targetChild: number;
    targetAnimationComplete: () => void;
}

const DEFAULT_DURATION = 0.5;

export const FadeSwitchContext = createContext<FadeSwitchContext>({
    duration: DEFAULT_DURATION,
    firstMount: true,
    fadeActive: false,
    activeChild: 0,
    targetChild: 0,
    targetAnimationComplete: () => { return; }
});

/*
    Trigger when FadeIn animation is completed for new FadeContainer
*/
const TARGET_ANIMATION = 1 << 0;
/*
    Trigger when old FadeContainer finishes its animation
*/
const EXIT_COMPLETE = 1 << 1;



export const FadeSwitch: React.FC<FadeSwitchProps> = ({ transportId, activeChild, duration, children }) => {
    const definedDuration = duration !== undefined ? duration : DEFAULT_DURATION;
    const definedActiveChild = activeChild !== undefined ? activeChild : 0;
    const [firstMount, setFirstMount] = useState(true);
    const [state, setState] = useState<Omit<FadeSwitchContext, "duration" | "firstMount" | "targetAnimationComplete"> & { switchStatus: number; }>({
        fadeActive: false,
        activeChild: definedActiveChild,
        targetChild: definedActiveChild,
        switchStatus: 0
    });

    useEffect(() => {
        if (firstMount) {
            return;
        }
        setState((s) => {
            return {
                ...s,
                fadeActive: true,
                activeChild: definedActiveChild
            };
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [definedActiveChild]);

    function targetAnimationComplete(): void {
        setState((s) => {
            const newStatus = s.switchStatus | TARGET_ANIMATION;
            return { ...s, switchStatus: newStatus };
        });
    }

    useEffect(() => setFirstMount(false), []);

    const ctx: FadeSwitchContext = {
        firstMount: firstMount,
        fadeActive: definedActiveChild !== state.activeChild || state.fadeActive,
        activeChild: state.activeChild,
        targetChild: definedActiveChild,
        transportId: transportId,
        duration: definedDuration,
        targetAnimationComplete: targetAnimationComplete
    };

    if (state.switchStatus === (TARGET_ANIMATION | EXIT_COMPLETE)) {
        setState((s) => {
            return { ...s, fadeActive: false, switchStatus: 0 };
        });
    }

    return (
        <FadeSwitchContext.Provider
            value={ctx}
        >
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence
                    initial={false}
                    onExitComplete={() => {
                        setState((s) => {
                            const newStatus = s.switchStatus | EXIT_COMPLETE;
                            return { ...s, switchStatus: newStatus };
                        });
                    }}
                >
                    <FadeContainer
                        key={state.activeChild}
                        index={state.activeChild}
                    >
                        {children[state.activeChild]}
                    </FadeContainer>
                </AnimatePresence>
            </AnimateSharedLayout>
        </FadeSwitchContext.Provider>
    );
};