import { accessClassName } from "@app/utils";
import { AnimatePresence, motion, Transition } from "framer-motion";
import React, { useContext } from "react";
import { InputKeyContext } from "../EditForm/context";
import { EditFormNavBar } from "../EditFormNavBar";
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
    const { inputKey } = useContext(InputKeyContext);
    const defMode: EditFormViewMode = mode !== undefined ? mode : "input";
    const defInputFormProps: InputFormProps = inputFormProps !== undefined
        ? inputFormProps
        : {};
    const defLabelFormProps: LabelFormProps = labelFormProps !== undefined
        ? labelFormProps
        : {};

    return (
        <div className={accessClassName(styles, "editFormView")}>
            <EditFormNavBar
                mode={mode}
                transitionDuration={0.4}
                onModeSwitch={onModeClick}
                disableLabelMode={disableLabelMode}
            />
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
                            <InputForm
                                key={inputKey}

                                {...defInputFormProps}
                            />
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