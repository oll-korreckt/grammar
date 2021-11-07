import React from "react";
import { Canvas, FadeIn, FadeOut } from "../_Fade/Fade";

export interface FadeContainerProps {
    firstMount: boolean;
}

export const FadeContainer: React.FC<FadeContainerProps> = ({ children, firstMount }) => {
    return (
        <Canvas firstMount={firstMount}>
            <FadeIn/>
            <FadeOut/>
            {children}
        </Canvas>
    );
};