import { accessClassName } from "@app/utils";
import React, { useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import styles from "./_styles.module.scss";
import { InputKeyContext } from "../context";

export interface EditFormViewSwitchProps<InputProps, LabelProps> {
    mode?: "input" | "label";
    transitionDuration?: number;
    inputProps: InputProps;
    labelProps: LabelProps;
}

export function createEditFormViewSwitch<InputProps, LabelProps>(inputComponent: React.VFC<InputProps>, labelComponent: React.VFC<LabelProps>): React.VFC<EditFormViewSwitchProps<InputProps, LabelProps>> {
    const InputComponent = inputComponent;
    const LabelComponent = labelComponent;
    const Output: React.VFC<EditFormViewSwitchProps<InputProps, LabelProps>> = ({ mode, transitionDuration, inputProps, labelProps }) => {
        const { inputKey } = useContext(InputKeyContext);
        const defMode = mode !== undefined ? mode : "input";
        const posUnit = "100vw";
        const negUnit = `-${posUnit}`;

        return (
            <div className={accessClassName(styles, "content")}>
                <AnimatePresence
                    initial={false}
                >
                    {defMode === "input" &&
                        <motion.div
                            key="input"
                            initial={{ x: negUnit }}
                            animate={{ x: 0 }}
                            exit={{ x: negUnit }}
                            transition={{ duration: transitionDuration }}
                            className={accessClassName(styles, "contentPanel")}
                        >
                            <InputComponent
                                key={inputKey}
                                {...inputProps}
                            />
                        </motion.div>
                    }
                    {defMode === "label" &&
                        <motion.div
                            key="label"
                            initial={{ x: posUnit }}
                            animate={{ x: 0 }}
                            exit={{ x: posUnit }}
                            transition={{ duration: transitionDuration }}
                            className={accessClassName(styles, "contentPanel")}
                        >
                            <LabelComponent {...labelProps}/>
                        </motion.div>
                    }
                </AnimatePresence>
            </div>
        );
    };
    Output.displayName = "EditFormViewSwitch";
    return Output;
}