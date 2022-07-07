import { accessClassName } from "@app/utils";
import React from "react";
import styles from "./_styles.module.scss";
import { EditFormPlayer } from "@app/tricky-components/EditFormPlayer";
import Link from "next/link";
import Image from "next/image";

const IMAGE_SIZE = 700;

export const HomePage: React.VFC = () => {
    return (
        <div className={accessClassName(styles, "container")}>
            <h1>Software for diagramming the English language</h1>
            <p>Am I supposed to use <i>I</i> or <i>me</i>? When do I have to use <i>well</i> instead of <i>good</i>? Do I need to use a comma here or can I leave it alone?</p>
            <p>Many of us use our intuition when faced with these sorts of questions. In other words, we guess. Fortunately, these sorts of questions are oftentimes governed by formal rules and therefore do have objective answers. However many are deterred by the confusing terminology and the often interdependent rules of grammar.</p>
            <div
                className={accessClassName(styles, "launchContainer")}
            >
                <Link
                    href="/app"
                >
                    <button className={accessClassName(styles, "launch")}>
                        Launch
                    </button>
                </Link>
            </div>
            <div className={accessClassName(styles, "content")}>
                <EditFormPlayer/>
            </div>
            <div className={accessClassName(styles, "featureSection", "reverse")}>
                <div className={accessClassName(styles, "featureSectionCenter")}>
                    <Image
                        className={accessClassName(styles, "imageSection")}
                        src="/enter-text.png"
                        layout="intrinsic"
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                    />
                    <div className={accessClassName(styles, "infoSection")}>
                        <h2>
                            Enter your sentence
                        </h2>
                        <p>
                            Text editor allows you to type in a sentence you wish to label. Basic syntax check is available to ensure that words are entered.
                        </p>
                    </div>
                </div>
            </div>
            <div className={accessClassName(styles, "featureSection")}>
                <div className={accessClassName(styles, "featureSectionCenter")}>
                    <Image
                        className={accessClassName(styles, "imageSection")}
                        src="/add-elements.png"
                        layout="intrinsic"
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                    />
                    <div className={accessClassName(styles, "infoSection")}>
                        <h2>
                            Add labels to your elements
                        </h2>
                        <p>
                            Interactive user interface allows elements to be labeled. Labels are available based on elements present.
                        </p>
                    </div>
                </div>
            </div>
            <div className={accessClassName(styles, "featureSection", "reverse")}>
                <div className={accessClassName(styles, "featureSectionCenter")}>
                    <Image
                        className={accessClassName(styles, "imageSection")}
                        src="/set-properties.png"
                        layout="intrinsic"
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                    />
                    <div className={accessClassName(styles, "infoSection")}>
                        <h2>
                            Configurable element properties
                        </h2>
                        <p>
                            Each element comes with its own set of properties.
                            Each property has a defined subset of element types
                            (for example: an adjective cannot be the object of a
                            preposition phrase) it can reference in order to aid
                            with configuration.
                        </p>
                    </div>
                </div>
            </div>
            <div className={accessClassName(styles, "featureSection")}>
                <div className={accessClassName(styles, "featureSectionCenter")}>
                    <Image
                        className={accessClassName(styles, "imageSection")}
                        src="/documentation.png"
                        layout="intrinsic"
                        width={IMAGE_SIZE}
                        height={IMAGE_SIZE}
                    />
                    <div className={accessClassName(styles, "infoSection")}>
                        <h2>
                            Interactive documentation
                        </h2>
                        <p>
                            Documentation is available for each grammatical element.
                            Much of the documentation contains interactive examples
                            to allow you to explore the relationships between elements.
                        </p>
                    </div>
                </div>
            </div>
            <div className={accessClassName(styles, "bottom")}></div>
        </div>
    );
};