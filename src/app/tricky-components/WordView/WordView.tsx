import React, { useContext } from "react";
import { accessClassName, DiagramStateContext, ElementData, ElementDisplayInfo, WordViewContext } from "@app/utils";
import { HeadLabel, Space, WordLabel, Word } from "@app/basic-components/Word";
import { makeRefComponent, RefComponent } from "@app/utils/hoc";
import { FaExternalLinkAlt } from "react-icons/fa";
// import { FiExternalLink } from "react-icons/fi";

export type BuildFunction = (Component: RefComponent<HTMLSpanElement>, data: ElementData) => RefComponent<HTMLSpanElement>;

function withSpace(Component: RefComponent<HTMLSpanElement>): RefComponent<HTMLSpanElement> {
    return makeRefComponent("withSpace", (_, ref) => (
        <>
            <Component ref={ref}/>
            <Space/>
        </>
    ));
}

export interface WordViewProps {
    buildFn?: BuildFunction;
}

const LinkIcon: React.VFC = () => (
    <>
        &nbsp;
        <FaExternalLinkAlt/>
    </>
);

export const WordView = makeRefComponent<HTMLDivElement, WordViewProps>("EditDiagram", ({ buildFn }, ref) => {
    const { visibleElements } = useContext(WordViewContext);

    function createElement(data: ElementData): RefComponent<HTMLSpanElement> {
        const displayInfo = ElementDisplayInfo.getDisplayInfo(data.type);
        const output = makeRefComponent<HTMLSpanElement>("", (_0, ref0) => (
            <WordLabel color={displayInfo.color} ref={ref0}>
                {data.lexemes.map((lexeme, index) => {
                    const key = `${data.key}-${index}`;
                    let Component = makeRefComponent<HTMLSpanElement>("", (_1, ref1) => (
                        <Word ref={ref1}>
                            {(data.head && index === 0) &&
                                <HeadLabel>
                                    {displayInfo.header}
                                    {data.ref !== undefined
                                        ? <LinkIcon/>
                                        : ""
                                    }
                                </HeadLabel>
                            }
                            {lexeme}
                        </Word>
                    ));
                    Component.displayName = key;
                    if (index < data.lexemes.length - 1) {
                        Component = withSpace(Component);
                    }
                    return <Component key={key}/>;
                })}
            </WordLabel>
        ));
        return buildFn ? buildFn(output, data) : output;
    }

    return (
        <div ref={ref}>
            {visibleElements.map((data, index) => {
                let Component = createElement(data);
                if (index < visibleElements.length - 1) {
                    Component = withSpace(Component);
                }
                return <Component key={data.key}/>;
            })}
        </div>
    );
});