import { accessClassName } from "@app/utils";
import React, { useRef } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { FadeSwitch } from "../FadeSwitch";
import { FadeTransport } from "../FadeTransport";
import { ActionDispatch, PropertyEditorAction, PropertyState } from "./types";
import { Property } from "./_Property/Property";
import { PropertySection } from "./_PropertySection/PropertySection";
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
        <div className={accessClassName(styles, "display")}>
            {displayState !== undefined &&
                <>
                    <PropertySection type="Assigned" dispatch={dispatch}>
                        {displayState.assigned}
                    </PropertySection>
                    <PropertySection type="Unassigned" dispatch={dispatch}>
                        {displayState.unassigned}
                    </PropertySection>
                </>
            }
        </div>
    );
};

interface EditBodyProps {
    state?: PropertyEditorEditState;
}

const EditBody: React.VFC<EditBodyProps> = ({ state }) => {
    const oldState = useRef(state);
    const editState = getState(oldState.current, state);
    oldState.current = editState;
    const property = editState?.property;

    return (
        <div className={accessClassName(styles, "edit")}>
            {property !== undefined &&
                <FadeTransport transportId={property.propertyKey}>
                    <Property
                        required={property.required}
                        satisfied={property.satisfied}
                    >
                        {property.displayName as string}
                    </Property>
                </FadeTransport>
            }
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
                    duration={duration !== undefined ? duration : 0.4}
                    transportId={transportId.current}
                >
                    {[
                        <DisplayBody key="0" state={displayState} dispatch={invokeDispatch} />,
                        <EditBody key="1" state={editState} />
                    ]}
                </FadeSwitch>
            </div>
        </div>
    );
};