import { SimpleObject } from "@lib/utils";
import React, { useCallback, useEffect, useReducer, useRef, useState } from "react";
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
                    throw `unanticipated number of entries: ${entries.length}`;
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

export interface LocalStorage {
    clear: () => void;
    reset: () => void;
    value?: string;
    update: (value: string) => void;
}

export interface DefinedLocalStorage extends Omit<LocalStorage, "value"> {
    value: string;
}

export interface TypedLocalStorage<T> extends Pick<LocalStorage, "clear" | "reset"> {
    value?: T;
    update: (value: T) => void;
}

export interface DefinedTypedLocalStorage<T> extends Omit<TypedLocalStorage<T>, "value"> {
    value: T;
}

export interface LocalStorageSerializer<T> {
    serialize: (value: T) => string;
    deserialize: (value: string) => T;
}

export type LocalStorageHook = () => LocalStorage;
export type DefinedLocalStorageHook = () => DefinedLocalStorage;
export type TypedLocalStorageHook<T> = () => TypedLocalStorage<T>;
export type DefinedTypedLocalStorageHook<T> = () => DefinedTypedLocalStorage<T>;

interface LocalStorageState<T> {
    command: "update" | "clear" | "reset" | "init";
    value?: T;
    default?: T;
}

type LocalStorageAction<T> = {
    type: "update";
    value: T;
} | {
    type: "clear";
} | {
    type: "reset";
}

function localStorageReducer<T>(state: LocalStorageState<T>, action: LocalStorageAction<T>): LocalStorageState<T> {
    let output: LocalStorageState<T>;
    switch (action.type) {
        case "update":
            output = {
                ...state,
                command: "update",
                value: action.value
            };
            break;
        case "clear":
            output = {
                ...state,
                command: "clear",
                value: state.default
            };
            break;
        case "reset":
            output = {
                ...state,
                command: "reset",
                value: state.default
            };
            break;
    }
    return SimpleObject.clean(output) as LocalStorageState<T>;
}

function localStorageInitializer<T>(config: FunctionConfig<T>): LocalStorageState<T> {
    const output: LocalStorageState<T> = { command: "init" };
    if (config.type === "defString" || config.type === "defTyped") {
        output.default = config.defaultValue as any;
    }
    const rawStoredValue = localStorage.getItem(config.key);
    if (rawStoredValue === null) {
        // not in localStorage
        output.value = output.default;
        return SimpleObject.clean(output) as LocalStorageState<T>;
    }
    if (config.type === "typed" || config.type === "defTyped") {
        const { deserialize } = config.serializer;
        output.value = deserialize(rawStoredValue);
    } else {
        output.value = rawStoredValue as any;
    }
    return SimpleObject.clean(output) as LocalStorageState<T>;
}

function storeValue<T>(config: FunctionConfig<T>, value?: T | string): void {
    if (value === undefined) {
        localStorage.removeItem(config.key);
        return;
    }
    const storeValueString = config.type === "typed" || config.type === "defTyped"
        ? config.serializer.serialize(value as T)
        : value as string;
    if (typeof storeValueString !== "string") {
        throw "cannot serializer non-strings in localStorage";
    }
    localStorage.setItem(config.key, storeValueString);
}

type FunctionConfig<T> = {
    type: "string";
    key: string;
} | {
    type: "defString";
    key: string;
    defaultValue: string;
} | {
    type: "typed";
    key: string;
    serializer: LocalStorageSerializer<T>;
} | {
    type: "defTyped";
    key: string;
    serializer: LocalStorageSerializer<T>;
    defaultValue: T;
}

function getFunctionConfig<T>(key: string, defaultValueOrSerializer?: string | LocalStorageSerializer<T>, defaultValue?: T): FunctionConfig<T> {
    const arg1 = 1 << 0;
    const arg2 = 1 << 1;
    let state = 0;
    if (defaultValueOrSerializer !== undefined) {
        state |= arg1;
    }
    if (defaultValue !== undefined) {
        state |= arg2;
    }
    switch (state) {
        case 0: {
            return { type: "string", key };
        }
        case arg1: {
            return typeof defaultValueOrSerializer === "string"
                ?
                {
                    type: "defString",
                    defaultValue: defaultValueOrSerializer,
                    key
                }
                :
                {
                    type: "typed",
                    serializer: defaultValueOrSerializer as LocalStorageSerializer<T>,
                    key
                };
        }
        case arg1 | arg2: {
            return {
                type: "defTyped",
                serializer: defaultValueOrSerializer as LocalStorageSerializer<T>,
                defaultValue: defaultValue as T,
                key
            };
        }
        default: {
            throw "Unexpected function configuration";
        }
    }
}

export function createLocalStorageHook(key: string): LocalStorageHook
export function createLocalStorageHook(key: string, defaultValue: string): DefinedLocalStorageHook
export function createLocalStorageHook<T>(key: string, serializer: LocalStorageSerializer<T>): TypedLocalStorageHook<T>;
export function createLocalStorageHook<T>(key: string, serializer: LocalStorageSerializer<T>, defaultValue: T): DefinedTypedLocalStorageHook<T>
export function createLocalStorageHook<T>(key: string, defaultValueOrSerializer?: string | LocalStorageSerializer<T>, defaultValue?: T): LocalStorageHook | DefinedLocalStorageHook | TypedLocalStorageHook<T> | DefinedTypedLocalStorageHook<T> {

    const config = getFunctionConfig(key, defaultValueOrSerializer, defaultValue);

    const useLocalStorage: LocalStorageHook | TypedLocalStorageHook<T> = () => {
        const [state, dispatch] = useReducer(localStorageReducer, config, localStorageInitializer);

        useEffect(() => {
            const { command } = state;
            switch (command) {
                case "init": {
                    // do nothing
                    break;
                }
                case "clear": {
                    localStorage.removeItem(config.key);
                    break;
                }
                case "reset": {
                    if (config.type === "defString" || config.type === "defTyped") {
                        storeValue(config, config.defaultValue);
                    } else {
                        localStorage.removeItem(config.key);
                    }
                    break;
                }
                case "update": {
                    storeValue(config as any, state.value);
                    break;
                }
            }
        }, [state]);

        return SimpleObject.clean({
            clear: () => dispatch({ type: "clear" }),
            reset: () => dispatch({ type: "reset" }),
            update: (value: any) => dispatch({ type: "update", value }),
            value: state.value
        }) as any;
    };

    return useLocalStorage;
}