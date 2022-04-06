import { RenderFragment } from "@app/basic-components/HTMLObjectRender/elements";
import { accessClassName } from "@app/utils";
import React from "react";
import { ViewAction, ExampleBlockquoteViewContext, ViewState } from "./types";
import { FaPlusCircle, FaRedo, FaTimes, FaUndo } from "react-icons/fa";
import { IconType } from "react-icons";
import styles from "./_styles.module.scss";
import { LabelView } from "@app/tricky-components/LabelView";
import { withClassNameProp } from "@app/utils/hoc";
import { NavigateMenu } from "@app/tricky-components/NavigateMenu";

export type ExampleBlockquoteViewProps =
    ViewState & { dispatch?: React.Dispatch<ViewAction>; };

export const ExampleBlockquoteView: React.VFC<ExampleBlockquoteViewProps> = ({ dispatch, ...state }) => {
    const invokeDispatch: React.Dispatch<ViewAction> = dispatch !== undefined
        ? dispatch
        : () => { return; };
    const classes = [];
    switch (state.type) {
        case "closed":
        case "loading":
        case "open":
            classes.push("displayContent");
            break;
        case "error":
            break;
    }

    return (
        <ExampleBlockquoteViewContext.Provider value={state}>
            <blockquote className={accessClassName(styles, ...classes)}>
                {(state.type === "closed" || state.type === "loading") &&
                    <>
                        <RenderFragment>
                            {state.children?.content}
                        </RenderFragment>
                        <div className={accessClassName(styles, "buttonContainer")}>
                            <FaPlusCircle
                                onClick={() => invokeDispatch({ type: "closed: open model" })}
                            />
                        </div>
                        {state.type === "loading" &&
                            <div className={accessClassName(styles, "loading")}>
                            </div>
                        }
                    </>
                }
                {state.type === "open" &&
                    <>
                        <ExtendedLabelView
                            className={accessClassName(styles, "labelView")}
                            onLabelClick={(id) => invokeDispatch({ type: "open: element select", id })}
                            settings={state.settings}
                        >
                            {state.children}
                        </ExtendedLabelView>
                        <div className={accessClassName(styles, "buttonContainer")}>
                            <FaTimes
                                onClick={() => invokeDispatch({ type: "open: close model" })}
                            />
                        </div>
                        <div className={accessClassName(styles, "navMenuContainer")}>
                            <div
                                className={accessClassName(
                                    styles,
                                    "resetButton",
                                    state.showReset
                                        ? "resetButtonEnabled"
                                        : "resetButtonDisabled"
                                )}
                                onClick={() => invokeDispatch({ type: "open: reset view" })}
                            >
                                <FaUndo/>
                                Reset
                            </div>
                            <ExtendedNavigateMenu
                                className={accessClassName(styles, "navMenu")}
                                category={state.category}
                                onCategoryChange={(category) => invokeDispatch({ type: "open: category select", category })}
                                enableUpLevel={state.showUpLevel}
                                onUpLevel={() => invokeDispatch({ type: "open: up level" })}
                            />
                        </div>
                    </>
                }
                {state.type === "error" &&
                    <div className={accessClassName(styles, "errorMsg")}>
                        <p>Error loading model.</p>
                        <p>
                            <ErrorButton
                                icon={FaRedo}
                                onClick={() => invokeDispatch({ type: "error: retry" })}
                            >
                                Retry
                            </ErrorButton>
                            <ErrorButton
                                icon={FaTimes}
                                onClick={() => invokeDispatch({ type: "error: cancel" })}
                            >
                                Cancel
                            </ErrorButton>
                        </p>
                    </div>
                }
            </blockquote>
        </ExampleBlockquoteViewContext.Provider>
    );
};

const ExtendedLabelView = withClassNameProp(LabelView);
const ExtendedNavigateMenu = withClassNameProp(NavigateMenu);

interface ErrorButtonProps {
    icon: IconType;
    children: string;
    onClick?: () => void;
}

const ErrorButton: React.VFC<ErrorButtonProps> = ({ children, icon, onClick }) => {
    const Icon = icon;
    return (
        <div
            className={accessClassName(styles, "errorButton")}
            onClick={() => onClick && onClick()}
        >
            <Icon className={accessClassName(styles, "errorButtonIcon")}/>
            {children}
        </div>
    );
};