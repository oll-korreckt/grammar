import React, { useEffect } from "react";

export interface FrameProps {
    duration?: number;
    onComplete?: () => void;
}

export const Frame: React.FC<FrameProps> = ({ duration, onComplete, children }) => {
    useEffect(() => {
        if (duration !== undefined && onComplete !== undefined) {
            setTimeout(onComplete, duration);
        }
    }, [duration, onComplete]);

    return <>{children}</>;
};