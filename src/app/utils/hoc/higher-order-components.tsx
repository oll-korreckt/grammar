/* eslint-disable @typescript-eslint/ban-types */
import React, { useEffect, useRef } from "react";

export type RefComponent<TElement extends HTMLElement, TProps = {}> = React.ForwardRefExoticComponent<React.PropsWithoutRef<TProps> & React.RefAttributes<TElement>>;
type Action<TElement extends HTMLElement, TProps> = (props: TProps, instance: TElement) => void;
export interface ForwardRefRenderFunction<TElement extends HTMLElement, TProps = {}> extends Pick<React.ForwardRefRenderFunction<TElement, TProps>, "displayName" | "defaultProps" | "propTypes"> {
    (props: TProps, ref: React.ForwardedRef<TElement>): React.ReactElement | null;
}

export function makeRefComponent<TElement extends HTMLElement, TProps = {}>(displayName: string, render: ForwardRefRenderFunction<TElement, TProps>): RefComponent<TElement, TProps> {
    const output = React.forwardRef(render);
    output.displayName = displayName;
    return output;
}

export function makeRefHoc<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    wrapperName: string,
    action: Action<TElement, TProps>): RefComponent<TElement, TProps> {
    const hocRenderFunction: React.ForwardRefRenderFunction<TElement, TProps> = (props, ref) => {
        let newRef: React.Ref<TElement>;
        if (ref === null) {
            newRef = (i) => i && action(props, i);
        } else if (typeof ref === "object") {
            newRef = (i) => {
                ref.current = i;
                i && action(props, i);
            };
        } else if (typeof ref === "function") {
            newRef = (i) => {
                ref(i);
                i && action(props, i);
            };
        } else {
            throw "Unexpected ref. Received a value that is not null, an object, or a function.";
        }
        return <Component {...props} ref={newRef} />;
    };
    const output = React.forwardRef(hocRenderFunction);
    output.displayName = `${wrapperName}(${Component.displayName})`;
    return output;
}

export function withEventListener<TElement extends HTMLElement, TProps, TEventType extends keyof HTMLElementEventMap>(Component: RefComponent<TElement, TProps>, type: TEventType, listener: (ev: HTMLElementEventMap[TEventType]) => any): RefComponent<TElement, TProps> {
    return makeRefHoc(
        Component,
        "withEventListener",
        (_, instance) => instance.addEventListener(type, listener)
    );
}

export function withClassName<TElement extends HTMLElement, TProps>(Component: RefComponent<TElement, TProps>, ...classNames: string[]): RefComponent<TElement, TProps>
export function withClassName<TElement extends HTMLElement, TProps>(Component: RefComponent<TElement, TProps>, classNamesFn: (props: TProps) => string[]): RefComponent<TElement, TProps>
export function withClassName<TElement extends HTMLElement, TProps>(Component: RefComponent<TElement, TProps>, ...x: string[] | ((props: TProps) => string[])[]): RefComponent<TElement, TProps> {
    if (x.length === 0) {
        throw "Must have at least 1 className";
    }
    let action: Action<TElement, TProps>;
    const firstElementType = typeof x[0];
    switch (firstElementType) {
        case "string":
            const args = x as string[];
            action = (_, instance) => instance.classList.add(...args);
            break;
        case "function":
            const fn = x[0] as (props: TProps) => string[];
            action = (props, instance) => {
                const classNames = fn(props);
                instance.classList.add(...classNames);
            };
            break;
        default:
            throw `Unexpected element type ${firstElementType}`;
    }
    return makeRefHoc(Component, "withClassName", action);
}

export function withoutClassName<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    ...classNames: string[]): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withoutClassName", (_, instance) => instance.classList.remove(...classNames));
}

function isValidClassListString(value: string | undefined): value is string {
    return value !== undefined && value.length > 0;
}

export function withClassNameProp<TElement extends HTMLElement, TProps = {}>(Component: RefComponent<TElement, TProps>): RefComponent<TElement, TProps & { className?: string; }> {
    return makeRefComponent<TElement, TProps & { className?: string; }>(`withClassNameProp(${Component.displayName})`, ({ className, ...rest }, ref) => {
        const localRef = useRef<TElement>(null);
        const classNameRef = useRef<string>();

        useEffect(() => {
            if (localRef.current !== null) {
                const classList = localRef.current.classList;
                if (isValidClassListString(classNameRef.current)) {
                    classList.remove(...classNameRef.current.split(" "));
                }
                if (isValidClassListString(className)) {
                    classList.add(...className.split(" "));
                    classNameRef.current = className;
                }
            }
        }, [className]);

        return <Component ref={mergeRefs(localRef, ref)} {...rest as TProps}/>;
    });
}


type SupportedEvents = Extract<keyof HTMLElementEventMap, "click">;
type EventNameMapper<TEvent extends SupportedEvents> =
    TEvent extends "click" ? "onClick"
    : never;
type EventNameMapperObject = {
    [Key in SupportedEvents]: EventNameMapper<Key>;
};
const mapperObj: EventNameMapperObject = {
    click: "onClick"
};
type EventMapper<TEvent extends SupportedEvents> = { [Key in EventNameMapper<TEvent>]?: () => void; };

function extractCallbackProp<TProps extends {}, TEvent extends SupportedEvents>(
    props: TProps & EventMapper<TEvent>, type: TEvent): [EventMapper<TEvent>[EventNameMapper<TEvent>], TProps] {
    const propsCopy = { ...props } as Record<string, unknown>;
    const callbackPropName = mapperObj[type];
    const callbackProp = propsCopy[callbackPropName] as EventMapper<TEvent>[EventNameMapper<TEvent>];
    delete propsCopy[callbackPropName];
    return [callbackProp, propsCopy as TProps];
}

export function withEventProp<TEvent extends SupportedEvents, TElement extends HTMLElement, TProps = {}>(Component: RefComponent<TElement, TProps>, type: TEvent): RefComponent<TElement, TProps & EventMapper<TEvent>> {
    const displayName = `with_${type}_EventProp(${Component.displayName})`;
    return makeRefComponent<TElement, TProps & EventMapper<TEvent>>(displayName, (props, ref) => {
        const localRef = useRef<TElement>(null);
        const [callback, cmpProps] = extractCallbackProp<TProps, TEvent>(props, type);
        useEffect(() => {
            if (localRef.current !== null) {
                const event = () => callback && callback();
                const cleanupVar = localRef.current;
                cleanupVar.addEventListener(type, event);
                return () => cleanupVar.removeEventListener(type, event);
            }
        }, [callback]);

        return <Component ref={mergeRefs(localRef, ref)} {...cmpProps}/>;
    });
}

function mergeRefs<T>(ref1: React.ForwardedRef<T>, ref2: React.ForwardedRef<T>): React.ForwardedRef<T> {
    return (value) => {
        [ref1, ref2].forEach((ref) => {
            if (typeof ref === "function") {
                ref(value);
            } else if (ref !== null) {
                ref.current = value;
            }
        });
    };
}