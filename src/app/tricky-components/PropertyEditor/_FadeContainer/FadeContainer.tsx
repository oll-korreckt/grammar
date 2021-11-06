import React from "react";
import { Canvas, FadeIn, FadeOut } from "../_Fade/Fade";

export const FadeContainer: React.FC = ({ children }) => {
    return (
        <>
            <FadeIn/>
            <FadeOut/>
            <Canvas>
                {children}
            </Canvas>
        </>
    );
};