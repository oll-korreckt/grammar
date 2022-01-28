import { accessClassName } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import React from "react";
import styles from "./_styles.scss";

export interface MessageBoxProps {
    buttons: MessageBoxButton[];
    children: string;
    onButtonClick?: (text: string) => void;
}

export interface MessageBoxButton {
    text: string;
    alignment: "left" | "right";
}

interface SortedMessageBoxButtons {
    leftButtons?: MessageBoxButton[];
    rightButtons?: MessageBoxButton[];
}

function sortButtons(buttons: MessageBoxButton[]): SortedMessageBoxButtons {
    if (buttons.length === 0) {
        throw "No buttons provided";
    } else if (buttons.length > 3) {
        throw "More than 3 buttons provided";
    }
    const uniqueButtons = new Set(buttons.map(({ text }) => text));
    if (uniqueButtons.size !== buttons.length) {
        throw "Duplicate buttons provided";
    }
    const leftButtons: MessageBoxButton[] = [];
    const rightButtons: MessageBoxButton[] = [];
    buttons.forEach((button) => {
        if (button.alignment === "left") {
            leftButtons.push(button);
        } else {
            rightButtons.push(button);
        }
    });
    const output: SortedMessageBoxButtons = {};
    if (leftButtons.length > 0) {
        output.leftButtons = leftButtons;
    }
    if (rightButtons.length > 0) {
        output.rightButtons = rightButtons;
    }
    return output;
}

export const MessageBox = makeRefComponent<HTMLDivElement, MessageBoxProps>("MessageBox", ({ buttons, children, onButtonClick }, ref) => {
    const { leftButtons, rightButtons } = sortButtons(buttons);
    function invokeOnButtonClick(text: string): void {
        if (onButtonClick) {
            onButtonClick(text);
        }
    }

    const buttonSectionClass = leftButtons !== undefined && rightButtons !== undefined
        ? "twoButtonSections"
        : "oneButtonSection";

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "messageBox")}
        >
            <div className={accessClassName(styles, "messageSection")}>
                {children}
            </div>
            <div className={accessClassName(styles, buttonSectionClass)}>
                {leftButtons &&
                    <div
                        key="left"
                        className={accessClassName(styles, "leftButtonSection")}
                    >
                        {leftButtons.map(({ text }) => (
                            <button
                                key={text}
                                className={accessClassName(styles, "button")}
                                onClick={() => invokeOnButtonClick(text)}
                            >
                                {text}
                            </button>
                        ))}
                    </div>

                }
                {rightButtons &&
                    <div
                        key="right"
                        className={accessClassName(styles, "rightButtonSection")}
                    >
                        {rightButtons.map(({ text }) => (
                            <button
                                key={text}
                                className={accessClassName(styles, "button")}
                                onClick={() =>invokeOnButtonClick(text)}
                            >
                                {text}
                            </button>
                        ))}
                    </div>
                }
            </div>
        </div>
    );
});