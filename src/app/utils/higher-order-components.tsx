import React from "react";

export type RefComponent<TElement extends HTMLElement, TProps> = React.ForwardRefExoticComponent<React.PropsWithoutRef<TProps> & React.RefAttributes<TElement>>;
type Action<TElement extends HTMLElement> = (instance: TElement) => void;

export function makeRefComponent<TElement extends HTMLElement, TProps>(displayName: string, render: React.ForwardRefRenderFunction<TElement, TProps>): RefComponent<TElement, TProps> {
    const output = React.forwardRef(render);
    output.displayName = displayName;
    return output;
}

export function makeRefHoc<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    wrapperName: string,
    action: Action<TElement>): RefComponent<TElement, TProps> {
    const hocRenderFunction: React.ForwardRefRenderFunction<TElement, TProps> = (props, ref) => {
        let newRef: React.Ref<TElement>;
        if (ref === null) {
            newRef = (i) => i && action(i);
        } else if (typeof ref === "object") {
            newRef = (i) => {
                ref.current = i;
                i && action(i);
            };
        } else if (typeof ref === "function") {
            newRef = (i) => {
                ref(i);
                i && action(i);
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

export function withOnClick<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    onClick: () => void): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withOnClick", (instance) => instance.addEventListener("click", onClick));
}

export function withClassName<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    ...classNames: string[]): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withClassName", (instance) => instance.classList.add(...classNames));
}

export function withoutClassName<TElement extends HTMLElement, TProps>(
    Component: RefComponent<TElement, TProps>,
    ...classNames: string[]): RefComponent<TElement, TProps> {
    return makeRefHoc(Component, "withoutClassName", (instance) => instance.classList.remove(...classNames));
}