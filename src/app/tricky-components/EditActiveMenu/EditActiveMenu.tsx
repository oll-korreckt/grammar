import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useRef } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { FadeSwitch } from "../FadeSwitch";
import { FadeTransport } from "../FadeTransport";
import { EditActiveMenuDispatch, EditActiveMenuAction, PropertyState } from "./types";
import { Property } from "./_Property";
import { PropertySection } from "./_PropertySection";
import styles from "./_styles.scss";


export interface EditActiveMenuProps {
    state: EditActiveMenuState;
    elementType?: ElementType;
    dispatch?: EditActiveMenuDispatch;
    duration?: number;
}

export interface EditActiveMenuDisplayState {
    type: "display";
    allowSubmit?: boolean | undefined;
    assigned: PropertyState[];
    unassigned: PropertyState[];
}

export interface EditActiveMenuEditState {
    type: "edit";
    allowSubmit?: boolean | undefined;
    property: PropertyState;
}

export type EditActiveMenuState = EditActiveMenuDisplayState | EditActiveMenuEditState;

interface DisplayBodyProps {
    state?: EditActiveMenuDisplayState;
    dispatch: EditActiveMenuDispatch;
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
    state?: EditActiveMenuEditState;
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

function getSubmitClass(allowSubmit: boolean | undefined): string {
    const submitEnabled = "submitEnabled";
    const submitDisabled = "submitDisabled";
    if (allowSubmit === undefined) {
        return submitEnabled;
    }
    return allowSubmit ? submitEnabled : submitDisabled;
}

export const EditActiveMenu = makeRefComponent<HTMLDivElement, EditActiveMenuProps>("PropertyEditor", ({ state, elementType, dispatch, duration }, ref) => {
    const invokeDispatch = (action: EditActiveMenuAction) => dispatch && dispatch(action);
    const prevState = useRef(state);
    const transportId = useRef<string>();
    const displayState: EditActiveMenuDisplayState | undefined = state.type === "display" ? state : undefined;
    const editState: EditActiveMenuEditState | undefined = state.type === "edit" ? state : undefined;
    const header = elementType !== undefined
        ? ElementDisplayInfo.getAbbreviatedName(ElementDisplayInfo.getDisplayInfo(elementType))
        : undefined;
    const activeChild = state.type === "display" ? 0 : 1;

    if (state.type === "edit"
        && prevState.current.type === "display") {
        transportId.current = state.property.propertyKey;
    }
    prevState.current = state;

    return (
        <div
            ref={ref}
            className={accessClassName(styles, "container")}
        >
            <div className={accessClassName(styles, "bar")}>
                <FaArrowLeft
                    className={accessClassName(styles, state.type === "edit" ? "back" : "hide")}
                    onClick={() => invokeDispatch({ type: "exit edit" })}
                />
                <div className={accessClassName(styles, "header")}>
                    {header}
                </div>
                <FaTimes
                    className={accessClassName(styles, "close")}
                    onClick={() => invokeDispatch({ type: "close" })}
                />
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
            <div className={accessClassName(styles, "bottom")}>
                <button
                    className={accessClassName(styles, "submit", getSubmitClass(state.allowSubmit))}
                    onClick={() => invokeDispatch({ type: "submit" })}
                >
                    Submit
                </button>
            </div>
        </div>
    );
});