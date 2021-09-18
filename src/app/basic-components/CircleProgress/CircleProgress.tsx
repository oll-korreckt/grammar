import { accessClassName } from "@app/utils";
import React, { useLayoutEffect, useRef, useState } from "react";
import styles from "./_styles.scss";

export interface CircleProgressProps {
    progress: number;
    thickness: string;
    colors?: HsvColor[];
}

export type HsvColor = {
    hue: number;
    saturation: number;
    lightness: number;
}

function between(progress: number, pct1: number | undefined, pct2: number): boolean {
    return pct1 === undefined
        ? progress <= pct2
        : progress > pct1 && progress <= pct2;
}

function calcPct(x: number, size: number): number {
    return x * 100 / size;
}

function interp(progress: number, pct1: number | undefined, pct2: number, color1: HsvColor | undefined, color2: HsvColor): HsvColor {
    function _interp(x1: number, y1: number, x2: number, y2: number, x: number): number {
        const a = (y2 - y1) / (x2 - x1);
        const b = x - x1;
        const c = y1;
        return a * b + c;
    }
    function _interpProp(x1: number, y1: HsvColor, x2: number, y2: HsvColor, x: number, prop: keyof HsvColor): number {
        const y1Val = y1[prop];
        const y2Val = y2[prop];
        return _interp(x1, y1Val, x2, y2Val, x);
    }

    if (pct1 === undefined) {
        return color2;
    }
    const castColor1 = color1 as HsvColor;
    return {
        hue: _interpProp(pct1, castColor1, pct2, color2, progress, "hue"),
        saturation: _interpProp(pct1, castColor1, pct2, color2, progress, "saturation"),
        lightness: _interpProp(pct1, castColor1, pct2, color2, progress, "lightness")
    };
}

function calcColor(progress: number, colors: HsvColor[]): HsvColor {
    let pct1: number | undefined = undefined;
    for (let index = 0; index < colors.length; index++) {
        const pct2: number = calcPct(index, colors.length - 1);
        if (between(progress, pct1, pct2)) {
            const color1: HsvColor | undefined = colors[index - 1];
            const color2: HsvColor = colors[index];
            return interp(progress, pct1, pct2, color1, color2);
        }
        pct1 = pct2;
    }
    throw "error";
}

function useIsMounted(): boolean {
    const [isMounted, setIsMounted] = useState(false);
    useLayoutEffect(() => {
        setIsMounted(true);
    }, []);
    return isMounted;
}

export const CircleProgress: React.FC<CircleProgressProps> = ({ progress, thickness, colors, children }) => {
    const svgRef = useRef<SVGSVGElement>(null);
    const isMounted = useIsMounted();
    useLayoutEffect(() => {
        if (svgRef.current !== null) {
            const node = svgRef.current;
            const { width, height } = node.getBoundingClientRect();
            if (width !== height) {
                throw "width and height of body most be equal";
            }
            const radius = width / 2;
            const circumference = 2 * Math.PI * radius;
            const dashOffset = (100 - progress) * circumference / 100;
            node.style.strokeDasharray = circumference.toString();
            node.style.strokeDashoffset = dashOffset.toString();
        }
    }, [progress]);

    const circleClasses: string[] = ["circle"];
    if (isMounted) {
        circleClasses.push("circlePostMount");
    } else {
        circleClasses.push("circlePreMount");
    }

    const { hue, saturation, lightness }: HsvColor = colors === undefined
        ? { hue: 0, saturation: 0, lightness: 0 }
        : calcColor(progress, colors);
    const circleStyle: React.CSSProperties = {
        strokeWidth: thickness,
        stroke: `hsl(${hue}deg, ${saturation}%, ${lightness}%)`
    };

    return (
        <div
            className={accessClassName(styles, "circleProgress")}
            style={{ padding: thickness }}
        >
            <div
                className={accessClassName(styles, "svgOuterContainer")}
                style={{ padding: `calc(${thickness} / 2)` }}
            >
                <div className={accessClassName(styles, "svgInnerContainer")}>
                    <svg
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                        className={accessClassName(styles, "svg")}
                        ref={svgRef}
                    >
                        <circle
                            cx="50"
                            cy="50"
                            r="50"
                            className={accessClassName(styles, ...circleClasses)}
                            style={circleStyle}
                            key="circle"
                        />
                    </svg>
                </div>
            </div>
            {children}
        </div>
    );
};