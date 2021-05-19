import React from "react";
import styles from "./_styles.scss";

export interface ButtonsProps {
    onClick?: () => void;
}

export const OkButton = createButtonComponent("Ok", styles.okButton);
export const CancelButton = createButtonComponent("Cancel", styles.cancelButton);

function createButtonComponent(text: string, className: string): React.VFC<ButtonsProps> {
    const output: ReturnType<typeof createButtonComponent> = ({ onClick }) => {
        return (
            <button onClick={onClick} className={className}>{text}</button>
        );
    };
    output.displayName = text;
    return output;
}