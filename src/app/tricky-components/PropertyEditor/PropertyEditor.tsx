import { accessClassName } from "@app/utils";
import React, { useRef } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { FadeSwitch } from "../FadeSwitch";
import { FadeTransport } from "../FadeTransport";
import { ActionDispatch, PropertyEditorAction, PropertyState } from "./types";
import { Property } from "./_Property/Property";
import styles from "./_styles.scss";


export interface PropertyEditorProps {
    state: PropertyEditorState;
    dispatch?: ActionDispatch;
    duration?: number;
}

export interface PropertyEditorDisplayState {
    type: "display";
    assigned: PropertyState[];
    unassigned: PropertyState[];
}

export interface PropertyEditorEditState {
    type: "edit";
    property: PropertyState;
}

export type PropertyEditorState = PropertyEditorDisplayState | PropertyEditorEditState;

interface DisplayBodyProps {
    state?: PropertyEditorDisplayState;
    dispatch: ActionDispatch;
}

function getState<T>(oldState: T | undefined, newState: T | undefined): T | undefined {
    if (newState !== undefined) {
        return newState;
    } else if (oldState !== undefined) {
        return oldState;
    }
    return undefined;
}

const DisplayBody: React.VFC<DisplayBodyProps> = ({ state, dispatch }) => {
    const oldState = useRef(state);
    const displayState = getState(oldState.current, state);
    oldState.current = displayState;

    return (
        <div style={{ position: "absolute", top: 300, display: "flex", flexDirection: "row" }}>
            {displayState !== undefined &&
                displayState.unassigned.map((prop) => {
                    console.log("display key", prop.propertyKey);
                    return (
                        <FadeTransport key={prop.propertyKey} transportId={prop.propertyKey}>
                            <Property onSelect={() => dispatch({ type: "property select", property: prop })}>
                                {prop.displayName as string}
                            </Property>
                        </FadeTransport>
                    );
                })
            }
        </div>
    );
};

interface EditBodyProps {
    state?: PropertyEditorEditState;
    dispatch: ActionDispatch;
}

const EditBody: React.VFC<EditBodyProps> = ({ state, dispatch }) => {
    const oldState = useRef(state);
    const editState = getState(oldState.current, state);
    oldState.current = editState;

    return (
        <div>
            {editState !== undefined &&
                <FadeTransport transportId={editState.property.propertyKey}>
                    <Property>
                        {editState.property.displayName as string}
                    </Property>
                </FadeTransport>
            }
            <div style={{ width: 100, height: 100, backgroundColor: "blue" }}></div>
        </div>
    );
};

export const PropertyEditor: React.VFC<PropertyEditorProps> = ({ state, dispatch, duration }) => {
    const invokeDispatch = (action: PropertyEditorAction) => dispatch && dispatch(action);
    const prevState = useRef(state);
    const transportId = useRef<string>();
    const displayState: PropertyEditorDisplayState | undefined = state.type === "display" ? state : undefined;
    const editState: PropertyEditorEditState | undefined = state.type === "edit" ? state : undefined;
    const activeChild = state.type === "display" ? 0 : 1;

    if (state.type === "edit"
        && prevState.current.type === "display") {
        transportId.current = state.property.propertyKey;
    }
    prevState.current = state;

    return (
        <div className={accessClassName(styles, "container")}>
            <div className={accessClassName(styles, "bar")}>
                {state.type === "edit" &&
                    <FaArrowLeft
                        className={accessClassName(styles, "back")}
                        onClick={() => invokeDispatch({ type: "exit edit" })}
                    />
                }
                <FaTimes className={accessClassName(styles, "close")} />
            </div>
            <div className={accessClassName(styles, "body")}>
                <FadeSwitch
                    activeChild={activeChild}
                    duration={duration !== undefined ? duration : 1}
                    transportId={transportId.current}
                >
                    {[
                        <DisplayBody key="0" state={displayState} dispatch={invokeDispatch} />,
                        <EditBody key="1" state={editState} dispatch={invokeDispatch} />
                    ]}
                </FadeSwitch>
            </div>
        </div>
    );
};