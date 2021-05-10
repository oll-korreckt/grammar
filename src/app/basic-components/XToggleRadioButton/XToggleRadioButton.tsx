import React from "react";
import { XToggleButton } from "../XToggleButton/XToggleButton";
import { useMachine } from "@xstate/react";
import { SimpleObject } from "@lib/utils";
import { Machine, MachineConfig, MachineOptions, assign } from "xstate";
import styles from "./_styles.scss";

export interface XToggleRadioButtonProps {
    initialItem?: string;
    children: XToggleRadioButtonChild[];
    onItemSelect?: (item: string) => void;
    onItemCancel?: () => void;
}

export type XToggleRadioButtonChild = [typeof XToggleButton, string]

export type Event = {
    type: "SELECT";
    selectedItem: string;
} | {
    type: "CANCEL";
};

export interface Context {
    selectedItem?: string;
}

export interface Schema {
    states: {
        selected: SimpleObject;
        notSelected: SimpleObject;
    };
}

function checkProps(props: XToggleRadioButtonProps) {
    const values = props.children.map(([, text]) => text);
    if (values.length < 2) {
        throw "XToggleRadioButton requires at least 2 child items";
    }
    if (props.initialItem && !values.includes(props.initialItem)) {
        throw "initialItem property does not refer to any of the text values";
    }
    const uniqueValues = new Set(values);
    if (values.length !== uniqueValues.size) {
        throw "Each item must have a unique text value";
    }
}

export function createConfig(initialItem: string | undefined): MachineConfig<Context, Schema, Event> {
    const initialState: keyof Schema["states"] = initialItem === undefined ? "notSelected" : "selected";
    return {
        id: "XToggleRadioButton",
        initial: initialState,
        context: {
            selectedItem: initialItem
        },
        states: {
            selected: {
                on: {
                    CANCEL: {
                        target: "notSelected",
                        actions: "setContext"
                    }
                }
            },
            notSelected: {
                on: {
                    SELECT: {
                        target: "selected",
                        actions: "setContext"
                    }
                }
            }
        }
    };
}

export const options: Pick<MachineOptions<Context, Event>, "actions"> = {
    actions: {
        setContext: assign({
            selectedItem: (_ctx, e) => {
                switch (e.type) {
                    case "SELECT":
                        return e.selectedItem;
                    case "CANCEL":
                        return undefined;
                }
            }
        })
    }
};

export const XToggleRadioButton: React.VFC<XToggleRadioButtonProps> = (props) => {
    checkProps(props);
    const [state, send] = useMachine(Machine(createConfig(props.initialItem), options));

    function handleCancel() {
        send({ type: "CANCEL" });
        props.onItemCancel && props.onItemCancel();
    }

    function handleSelect(text: string) {
        send({ type: "SELECT", selectedItem: text });
        props.onItemSelect && props.onItemSelect(text);
    }

    function renderChildren() {
        if (state.context.selectedItem) {
            let Component: XToggleRadioButtonChild[0] | undefined = undefined;
            let text: XToggleRadioButtonChild[1] | undefined = undefined;
            for (let i = 0; i < props.children.length; i++) {
                const [childComponent, childText] = props.children[i];
                if (childText === state.context.selectedItem) {
                    Component = childComponent;
                    text = childText;
                    break;
                }
            }
            if (Component === undefined
                || text === undefined) {
                throw `no child found with text '${props.initialItem}'`;
            }
            return <Component onClick={handleCancel} showX={true}>{text}</Component>;
        } else {
            return (
                <>
                    {props.children.map(([Component, text]) => {
                        return <Component key={text} onClick={handleSelect} showX={false}>{text}</Component>;
                    })}
                </>
            );
        }
    }

    return (
        <div className={styles.xToggleRadioButton}>
            {renderChildren()}
        </div>
    );
};