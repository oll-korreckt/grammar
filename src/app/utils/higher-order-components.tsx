import React from "react";

export function withClassContainer<T>(Component: React.VFC<T>, className: string): React.VFC<T>;
export function withClassContainer<T>(Component: React.FC<T>, className: string): React.FC<T>;
export function withClassContainer<T>(Component: React.VFC<T> | React.FC<T>, className: string): React.VFC<T> | React.FC<T> {
    const output = (props: T) => {
        return (
            <div className={className}>
                <Component {...props} />
            </div>
        );
    };
    output.displayName = Component.displayName;
    return output;
}
