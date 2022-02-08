import { accessClassName } from "@app/utils";
import { AnimatePresence, AnimateSharedLayout, motion, Transition } from "framer-motion";
import React from "react";
import { IconType } from "react-icons";
import { FaEdit, FaTag } from "react-icons/fa";
import { InputForm, InputFormProps } from "../InputForm";
import { LabelForm } from "../LabelForm";
import { LabelFormProps } from "../LabelForm/types";
import styles from "./_styles.module.scss";

export interface EditFormViewProps {
    mode?: EditFormViewMode;
    onModeClick?: (mode: EditFormViewMode) => void;
    disableLabelMode?: boolean | undefined;
    inputFormProps?: InputFormProps;
    labelFormProps?: LabelFormProps;
}

export type EditFormViewMode = "input" | "label";

const transition: Transition = { duration: 0.4 };
export const EditFormView: React.VFC<EditFormViewProps> = ({ mode, onModeClick, disableLabelMode, inputFormProps, labelFormProps }) => {
    const defMode: EditFormViewMode = mode !== undefined ? mode : "input";
    const defInputFormProps: InputFormProps = inputFormProps !== undefined
        ? inputFormProps
        : {};
    const defLabelFormProps: LabelFormProps = labelFormProps !== undefined
        ? labelFormProps
        : {};

    return (
        <div className={accessClassName(styles, "editFormView")}>
            <div className={accessClassName(styles, "navBar")}>
                <div className={accessClassName(styles, "navBarContent")}>
                    <AnimateSharedLayout type="crossfade">
                        <Item
                            icon={FaEdit}
                            selected={mode === "input"}
                            onClick={() => onModeClick && onModeClick("input")}
                        >
                            Input
                        </Item>
                        <Item
                            icon={FaTag}
                            selected={mode === "label"}
                            onClick={() => onModeClick && onModeClick("label")}
                            disabled={disableLabelMode}
                        >
                            Label
                        </Item>
                    </AnimateSharedLayout>
                </div>
            </div>
            <div className={accessClassName(styles, "content")}>
                <AnimatePresence
                    initial={false}
                >
                    {defMode === "input" &&
                        <motion.div
                            key="input"
                            initial={{ x: "-100vw" }}
                            animate={{ x: 0 }}
                            exit={{ x: "-100vw" }}
                            transition={transition}
                            className={accessClassName(styles, "contentPanel")}
                        >
                            <InputForm {...defInputFormProps} />
                        </motion.div>
                    }
                    {defMode === "label" &&
                        <motion.div
                            key="label"
                            initial={{ x: "100vw" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100vw" }}
                            transition={transition}
                            className={accessClassName(styles, "contentPanel")}
                        >
                            <LabelForm {...defLabelFormProps} />
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        </div>
    );
};

interface ItemProps {
    onClick?: () => void;
    icon: IconType;
    selected?: boolean | undefined;
    children: string;
    disabled?: boolean | undefined;
}

const Item: React.VFC<ItemProps> = ({ onClick, icon, selected, children, disabled }) => {
    const Icon = icon;
    const classes = ["itemContent"];
    if (disabled) {
        classes.push("itemContentDisabled");
    }
    return (
        <div className={accessClassName(styles, "item")}>
            <div
                className={accessClassName(styles, ...classes)}
                onClick={() => onClick && onClick()}
            >
                <Icon className={accessClassName(styles, "itemIcon")} />
                <div className={accessClassName(styles, "itemChildren")}>
                    {children}
                </div>
                {selected &&
                    <motion.div
                        className={accessClassName(styles, "underline")}
                        transition={transition}
                        layout
                        layoutId="underline"
                    />
                }
            </div>
        </div>
    );
};