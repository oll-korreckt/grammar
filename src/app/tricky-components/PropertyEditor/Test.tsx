import { withDisable } from "@app/basic-components/Word";
import { AnimatePresence, AnimateSharedLayout, motion } from "framer-motion";
import React, { useEffect, useRef, useState } from "react";
import { AnimationContext } from "./types";
import { FadeContainer } from "./_FadeContainer/FadeContainer";
import { Property } from "./_Property/Property";


const styleBase: React.CSSProperties = {
    display: "inline-block",
    position: "absolute"
};

export const Test: React.VFC = () => {
    const [state, setState] = useState<"state0" | "state1">("state0");
    const [firstMount, setFirstMount] = useState(true);

    useEffect(() => setFirstMount(false), []);
    // const firstMountRef = useRef(true);
    // const firstMount = firstMountRef.current;
    // firstMountRef.current = false;

    return (
        <AnimationContext.Provider value={{ firstMount, activeProperty: "Hello" }}>
            <AnimateSharedLayout type="crossfade">
                <AnimatePresence
                    initial={false}
                >
                    {state === "state0" &&
                        <FadeContainer firstMount={firstMount} key="0">
                            <div
                                style={{
                                    ...styleBase,
                                    left: 10,
                                    top: 10
                                }}
                            >
                                <Property onSelect={() => setState("state1")}>
                                    Hello
                                </Property>
                                {/* <motion.div
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        backgroundColor: "orange"
                                    }}
                                    onClick={() => setState("state1")}
                                    layoutId="wow"
                                    layout="position"
                                >
                                </motion.div> */}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    backgroundColor: "orange",
                                    width: "50px",
                                    height: "50px",
                                    left: "400px",
                                    top: "400px"
                                }}
                            >

                            </div>
                        </FadeContainer>
                    }
                    {state === "state1" &&
                        <FadeContainer firstMount={firstMount} key="1">
                            <div
                                style={{
                                    ...styleBase,
                                    left: 50,
                                    top: 200
                                }}
                            >
                                <Property onCancel={() => setState("state0")}>
                                    Hello
                                </Property>
                                {/* <motion.div
                                    style={{
                                        width: "50px",
                                        height: "50px",
                                        backgroundColor: "orange"
                                    }}
                                    onClick={() => setState("state0")}
                                    layoutId="wow"
                                    layout="position"
                                >
                                </motion.div> */}
                            </div>
                            <div
                                style={{
                                    position: "absolute",
                                    width: "100px",
                                    height: "100px",
                                    backgroundColor: "blue",
                                    top: "10px",
                                    left: "400px"
                                }}
                            >
                            </div>
                            <div
                                style={{
                                    ...styleBase,
                                    left: 100,
                                    top: 0
                                }}
                            >
                                <Property>
                                    What
                                </Property>
                            </div>
                        </FadeContainer>
                    }
                </AnimatePresence>
            </AnimateSharedLayout>
        </AnimationContext.Provider>
    );
};