import React, { useEffect, useRef } from "react";

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