import React, { useCallback, useEffect, useRef, useState } from "react";
import { Rect } from "./types";

export function useOutsideClick<TRef extends HTMLElement>(callback: () => void): React.MutableRefObject<TRef | null> {
    const ref = useRef<TRef>(null);
    useEffect(() => {
        const event = (ev: MouseEvent) => {
            if (ref.current !== null
                && (ev.target === null
                    || !ref.current.contains(ev.target as Node))) {
                callback();
            }
        };
        document.addEventListener("mousedown", event);
        return () => document.removeEventListener("mousedown", event);
    });
    return ref;
}

export function useClientRect<TRef extends HTMLElement>(): [Rect | undefined, React.RefCallback<TRef>] {
    const [rect, setRect] = useState<Rect>();
    const ref = useCallback((node: TRef | null) => {
        if (node !== null) {
            const output = Rect.init(node.getBoundingClientRect());
            setRect(output);
        }
    }, []);
    return [rect, ref];
}