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

export function useResize<TRef extends HTMLElement>(callback: (e: TRef) => void): React.MutableRefObject<TRef | null> {
    const ref = useRef<TRef>(null);
    useEffect(() => {
        if (ref.current !== null) {
            const obs = new ResizeObserver((entries) => {
                if (entries.length !== 1) {
                    throw `unanticiplated number of entries: ${entries.length}`;
                }
                const [{ target }] = entries;
                callback(target as TRef);
            });
            obs.observe(ref.current);
            return () => obs.disconnect();
        }
    });
    return ref;
}

export function useClientSide(): boolean {
    const [render, setRender] = useState(false);
    const inBrowser = typeof window !== "undefined";
    useEffect(() => {
        if (inBrowser && !render) {
            setRender(true);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    return render;
}