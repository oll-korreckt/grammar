import { accessClassName, ElementDisplayInfo } from "@app/utils";
import { ElementReference, ElementType } from "@domain/language";
import { AnimatePresence, AnimateSharedLayout, motion, usePresence } from "framer-motion";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { createInvoke, EVENTS, INVALID_PROPERTY, PropertyContext, PropertyData, PropertyEditorAction } from "./types";
import { Display } from "./_Display/Display";
import { Property } from "./_Property/Property";
import { PropertySection, PropertySectionProps } from "./_PropertySection/PropertySection";
import styles from "./_styles.scss";

export interface PropertyEditorProps {
    type: Exclude<ElementType, "word">;
    item: Record<string, ElementReference | ElementReference[]>;
    property?: string;
    onAction?: (action: PropertyEditorAction) => void;
}

interface Properties {
    assigned: PropertyData[];
    unassigned: PropertyData[];
}

function getMotionProperty(previous: string | undefined, current: string | undefined): string {
    const prevBit = 1 << 0;
    const currBit = 1 << 1;
    let state = 0;
    if (previous !== undefined) {
        state |= prevBit;
    }
    if (current !== undefined) {
        state |= currBit;
    }
    switch (state) {
        case prevBit:
            return previous as string;
        case currBit:
            return current as string;
        default:
            throw "unhandled state";
    }
}

function getProperties(type: Exclude<ElementType, "word">, item: Record<string, ElementReference | ElementReference[]>): Properties {
    const output: Properties = { assigned: [], unassigned: [] };
    Object.entries(ElementDisplayInfo.getDisplayInfo(type).properties)
        .sort(([, a], [, b]) => a.displayOrder - b.displayOrder)
        .forEach(([key, value]) => {
            const data: PropertyData = { ...value, key };
            if (item[key] !== undefined) {
                output.assigned.push(data);
            } else {
                output.unassigned.push(data);
            }
        });
    return output;
}

export const PropertyEditor: React.VFC<PropertyEditorProps> = ({ type, item, property, onAction }) => {
    const [firstMount, setFirstMount] = useState(true);
    const invokeAction = createInvoke(onAction);
    const { assigned, unassigned } = getProperties(type, item);

    const displayClasses = ["layout"];
    const editClasses = ["layout"];

    const key: "display" | "edit" = property === undefined ? "display" : "edit";
    if (!firstMount) {
        switch (key) {
            case "display":
                displayClasses.push("z2");
                break;
            case "edit":
                editClasses.push("z2");
                break;
        }
    }


    useEffect(() => setFirstMount(false), []);

    return (
        <div className={accessClassName(styles, "container")}>
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence
                    initial={false}
                    custom={property}
                >
                    {key === "display" &&
                        <motion.div
                            key={key}
                            className={accessClassName(styles, ...displayClasses)}
                            {...EVENTS}
                            onAnimationStart={() => console.log("display start:", key)}
                            onAnimationComplete={() => console.log("animation complte")}
                            // transition={{ duration: 5 }}
                        >
                            <Display
                                assigned={assigned}
                                unassigned={unassigned}
                                actionDispatch={invokeAction}
                            />
                        </motion.div>
                    }
                    {key === "edit" &&
                        <motion.div
                            key={key}
                            className={accessClassName(styles, ...editClasses)}
                            onAnimationStart={() => console.log("edit start:", key)}
                            {...EVENTS}
                        >
                            <FaArrowLeft
                                onClick={() => invokeAction({
                                    type: "exit edit"
                                })}
                            />
                            <Property propertyId={property}>
                                {ElementDisplayInfo.getDisplayInfo(type).properties[property as string].fullName}
                            </Property>
                        </motion.div>
                    }
                </AnimatePresence>
            </AnimateSharedLayout>
        </div>
    );
};