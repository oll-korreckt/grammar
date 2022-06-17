import { accessClassName, ElementDisplayInfo, useUpdateDisplayState, AnimationIdBuilderContext, AnimationIdBuilderUtils, ClickListenerContext, ControlAnimationContext, ControlAnimationUtils } from "@app/utils";
import { makeRefComponent } from "@app/utils/hoc";
import { ElementType } from "@domain/language";
import React, { useContext, useEffect, useRef } from "react";
import { FaArrowLeft, FaTimes } from "react-icons/fa";
import { FadeSwitch } from "../FadeSwitch";
import { FadeTransport } from "../FadeTransport";
import { EditActiveMenuDispatch, EditActiveMenuAction, PropertyState } from "./types";
import { Property } from "./_Property";
import { PropertySection } from "./_PropertySection";
import hash from "object-hash";
import styles from "./_styles.module.scss";
import { IconType } from "react-icons";


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
    const { idBase } = useContext(AnimationIdBuilderContext);
    const oldState = useRef(state);
    const displayState = getState(oldState.current, state);
    oldState.current = displayState;

    const assignedIdBase = AnimationIdBuilderUtils.extendId(idBase, "display", "assigned");
    const unassignedIdBase = AnimationIdBuilderUtils.extendId(idBase, "display", "unassigned");

    return (
        <div className={accessClassName(styles, "display")}>
            {displayState !== undefined &&
                <>
                    <AnimationIdBuilderContext.Provider value={{ idBase: assignedIdBase }}>
                        <PropertySection type="Assigned" dispatch={dispatch}>
                            {displayState.assigned}
                        </PropertySection>
                    </AnimationIdBuilderContext.Provider>
                    <AnimationIdBuilderContext.Provider value={{ idBase: unassignedIdBase }}>
                        <PropertySection type="Unassigned" dispatch={dispatch}>
                            {displayState.unassigned}
                        </PropertySection>
                    </AnimationIdBuilderContext.Provider>
                </>
            }
        </div>
    );
};

interface EditBodyProps {
    state?: EditActiveMenuEditState;
}

const EditBody: React.VFC<EditBodyProps> = ({ state }) => {
    const { idBase } = useContext(AnimationIdBuilderContext);
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
                        animateId={AnimationIdBuilderUtils.extendId(idBase, property.propertyKey)}
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

export const EditActiveMenu = makeRefComponent<HTMLDivElement, EditActiveMenuProps>("EditActiveMenu", ({ state, elementType, dispatch, duration }, ref) => {
    const invokeDispatch = (action: EditActiveMenuAction) => dispatch && dispatch(action);
    const updateDisplay = useUpdateDisplayState();
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

    const displayStateHash = displayState ? hash(displayState) : "";

    useEffect(() => {
        if (displayState === undefined) {
            return;
        }
        const { allowSubmit, assigned, unassigned } = displayState;
        updateDisplay({
            type: "edit.active",
            editState: "display",
            elementType,
            allowSubmit,
            assigned,
            unassigned
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayStateHash]);

    const editStateHash = editState ? hash(editState) : "";

    useEffect(() => {
        if (editState === undefined) {
            return;
        }
        const { allowSubmit, property } = editState;
        updateDisplay({
            type: "edit.active",
            editState: "edit",
            elementType,
            allowSubmit,
            property
        });
        // start working here

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [editStateHash]);

    const idBase = "edit-active";

    return (
        <AnimationIdBuilderContext.Provider value={{ idBase }}>
            <div
                ref={ref}
                className={accessClassName(styles, "editActiveMenu")}
            >
                <div className={accessClassName(styles, "bar")}>
                    <IconButton
                        className={state.type === "edit" ? "back" : "hide"}
                        animateId={AnimationIdBuilderUtils.extendId(idBase, "back")}
                        onClick={() => invokeDispatch({ type: "exit edit" })}
                        icon={FaArrowLeft}
                    />
                    <div className={accessClassName(styles, "header")}>
                        {header}
                    </div>
                    <IconButton
                        className="close"
                        animateId={AnimationIdBuilderUtils.extendId(idBase, "close")}
                        onClick={() => invokeDispatch({ type: "close" })}
                        icon={FaTimes}
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
                        id={"edit-active.submit"}
                        onClick={() => invokeDispatch({ type: "submit" })}
                    >
                        Submit
                    </button>
                </div>
            </div>
        </AnimationIdBuilderContext.Provider>
    );
});

interface IconButtonProps {
    className: string;
    animateId?: string;
    onClick: () => void;
    icon: IconType;
}

const IconButton: React.VFC<IconButtonProps> = ({ className, animateId, onClick, icon }) => {
    const { onElementClick } = useContext(ClickListenerContext);
    const { activeElement } = useContext(ControlAnimationContext);
    const Icon = icon;

    const isAnimating = ControlAnimationUtils.isActive(animateId, activeElement);
    const containerClasses = ["iconButton"];
    if (isAnimating) {
        containerClasses.push("iconButtonAnimate");
    }

    const classes = [className];
    return (
        <div className={accessClassName(styles, ...containerClasses)}>
            <Icon
                className={accessClassName(styles, ...classes)}
                onClick={() => {
                    onElementClick && onElementClick(animateId);
                    onClick();
                }}
            />
        </div>

    );
};