import React, { useContext, useReducer, useState } from "react";
import { ModelPageContext } from "../types";
import { FaTimes, FaEdit, FaPlus } from "react-icons/fa";
import { accessClassName, useOutsideClick } from "@app/utils";
import styles from "./_styles.module.scss";
import { ElementModelAddress } from "@utils/model";
import { ElementPageId } from "@utils/element";
import Link from "next/link";
import { SERVER } from "config";

export interface AddressCluster {
    page: ElementPageId;
    names: string[];
}

export interface AddressClusterProps {
    children: AddressCluster;
}

function createKey(keys: string[]): string {
    if (keys.length === 0) {
        return "key";
    }
    const [first, ...remainder] = keys;
    let output = first;
    remainder.forEach((key) => output += key);
    return output;
}

export const AddressCluster: React.VFC<AddressClusterProps> = ({ children }) => {
    const { sendAdd } = useContext(ModelPageContext);
    const [state, setState] = useState<"display" | "add">("display");
    const { page, names } = children;
    const addKey = createKey(names);

    return (
        <li
            className={accessClassName(styles, "pageItem")}
        >
            <span
                className={accessClassName(styles, "itemText")}
            >
                {`${page} (${names.length})`}
                <FaPlus
                    className={accessClassName(styles, "icon")}
                    onClick={() => setState("add")}
                />
            </span>
            <ul
                className={accessClassName(styles, "pageItemContent")}
            >
                {state === "add" &&
                    <AddModelItem
                        key={addKey}
                        onSubmit={(name) => sendAdd(
                            { page, name },
                            () => setState("display")
                        )}
                        onCancel={() => setState("display")}
                    />
                }
                {names.map((name) => {
                    const address: ElementModelAddress = { page, name };
                    return (
                        <ModelItem
                            key={name}
                        >
                            {address}
                        </ModelItem>
                    );
                })}
            </ul>
        </li>
    );
};

interface ModelItemProps {
    children: ElementModelAddress;
}

interface ModelItemState {
    type: "display" | "rename" | "error";
    name: string;
    newName?: string;
}

type ModelItemAction = {
    type: "display: enter rename";
} | {
    type: "rename: cancel";
} | {
    type: "rename: update";
    newName: string;
} | {
    type: "rename: ok";
} | {
    type: "rename: error";
}

const invalidNewNameErrMsg = "invalid state. newName should be defined.";

function reducer(state: ModelItemState, action: ModelItemAction): ModelItemState {
    switch (action.type) {
        case "display: enter rename": {
            return {
                ...state,
                type: "rename",
                newName: state.name
            };
        }
        case "rename: update": {
            return {
                ...state,
                newName: action.newName
            };
        }
        case "rename: cancel": {
            const output: ModelItemState = {
                ...state,
                type: "display"
            };
            delete output.newName;
            return output;
        }
        case "rename: ok": {
            if (state.newName === undefined) {
                throw invalidNewNameErrMsg;
            }
            const output: ModelItemState = {
                ...state,
                type: "display",
                name: state.newName
            };
            delete output.newName;
            return output;
        }
        case "rename: error": {
            return {
                ...state,
                type: "error"
            };
        }
    }
}

const ModelItem: React.VFC<ModelItemProps> = ({ children }) => {
    const { page, name } = children;
    const [state, dispatch] = useReducer(reducer, { type: "display", name });
    const ref = useOutsideClick<HTMLLIElement>(() => dispatch({ type: "rename: cancel" }));
    const { sendRename, sendDelete } = useContext(ModelPageContext);

    return (
        <li
            ref={ref}
        >
            {state.type === "display"
                ?
                <>
                    <span
                        onDoubleClick={() => dispatch({ type: "display: enter rename" })}
                    >
                        {name}
                    </span>
                    <Link href={`${SERVER}/model/${page}/${name}`}>
                        <a>
                            <FaEdit className={accessClassName(styles, "icon")}/>
                        </a>
                    </Link>
                    <FaTimes
                        className={accessClassName(styles, "icon")}
                        onClick={() => sendDelete(children)}
                    />
                </>
                :
                <input
                    type="text"
                    value={state.newName}
                    onChange={({ target }) => dispatch({ type: "rename: update", newName: target.value })}
                    onKeyDown={(e) => {
                        const keyVal = e.key.toLowerCase();
                        switch (keyVal) {
                            case "enter": {
                                const { newName } = state;
                                if (newName === undefined) {
                                    throw invalidNewNameErrMsg;
                                }
                                const newAddress: ElementModelAddress = {
                                    name: newName,
                                    page
                                };
                                sendRename(children, newAddress);
                                break;
                            }
                            case "escape": {
                                dispatch({ type: "rename: cancel" });
                                break;
                            }
                        }
                    }}
                />
            }
        </li>
    );
};

interface AddModelItemProps {
    onSubmit?: (name: string) => void;
    onCancel?: () => void;
}

const AddModelItem: React.VFC<AddModelItemProps> = ({ onSubmit, onCancel }) => {
    const [value, setValue] = useState("");
    const invokeCancel = () => onCancel && onCancel();
    const invokeSubmit = () => onSubmit && onSubmit(value);
    const ref = useOutsideClick<HTMLInputElement>(invokeCancel);

    return (
        <input
            ref={ref}
            type="text"
            value={value}
            onChange={({ target }) => setValue(target.value)}
            onKeyDown={(e) => {
                const keyVal = e.key.toLowerCase();
                switch (keyVal) {
                    case "escape":
                        invokeCancel();
                        break;
                    case "enter":
                        invokeSubmit();
                        break;
                }
            }}
            autoFocus
        />
    );
};