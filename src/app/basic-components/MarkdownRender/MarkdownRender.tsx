import { HeadingType, MarkdownBold, MarkdownHeading, MarkdownItalic, MarkdownLink, MarkdownParagraph, MarkdownToken } from "@lib/utils/markdown";
import React, { DetailedHTMLProps, HTMLAttributes } from "react";

export interface MarkdownRenderProps {
    paragraphProps?: MarkdownElementProps<ParagraphProps, MarkdownParagraph>;
    italicProps?: MarkdownElementProps<ItalicProps, MarkdownItalic>;
    headingProps?: MarkdownElementProps<HeadingProps, MarkdownHeading>;
    anchorProps?: MarkdownElementProps<AnchorProps, MarkdownLink>;
    boldProps?: MarkdownElementProps<BoldProps, MarkdownBold>;
    children: MarkdownToken | MarkdownToken[];
}


type MarkdownElementProps<TElementProps extends ElementProps, TMarkdownToken extends MarkdownToken> =
    | TElementProps
    | MarkdownElementPropsFunction<TElementProps, TMarkdownToken>
    | undefined;
type MarkdownElementPropsFunction<TElementProps extends ElementProps, TMarkdownToken extends MarkdownToken> = (token: TMarkdownToken) => TElementProps;
type ChildlessElementProps<T extends HTMLElement> = Omit<DetailedHTMLProps<HTMLAttributes<T>, T>, "children">;
type ElementProps =
    | ParagraphProps
    | ItalicProps
    | HeadingProps
    | AnchorProps
    | BoldProps;
export type ParagraphProps = ChildlessElementProps<HTMLParagraphElement>;
export type ItalicProps = ChildlessElementProps<HTMLElement>;
export type HeadingProps = ChildlessElementProps<HTMLHeadingElement>;
export type AnchorProps = Omit<DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "children">;
export type BoldProps = ChildlessElementProps<HTMLElement>;

interface TokenRenderProps extends Omit<MarkdownRenderProps, "children"> {
    children: MarkdownToken;
}

function getProps<TElementProps extends ElementProps, TMarkdownToken extends MarkdownToken>(props: MarkdownElementProps<TElementProps, TMarkdownToken>, token: TMarkdownToken): TElementProps {
    switch (typeof props) {
        case "object":
            return props;
        case "function":
            return props(token);
        case "undefined":
            return {} as TElementProps;
        default:
            throw `Unhandled props of type '${typeof props}'`;
    }
}

const HeadingRender: React.FC<{ headingType: HeadingType; headingProps: HeadingProps; }> = ({ children, headingType, headingProps }) => {
    switch (headingType) {
        case 1:
            return <h1 {...headingProps}>{children}</h1>;
        case 2:
            return <h2 {...headingProps}>{children}</h2>;
        case 3:
            return <h3 {...headingProps}>{children}</h3>;
        case 4:
            return <h4 {...headingProps}>{children}</h4>;
        case 5:
            return <h5 {...headingProps}>{children}</h5>;
        case 6:
            return <h6 {...headingProps}>{children}</h6>;
        default:
            throw "";
    }
};

const TokenRender: React.VFC<TokenRenderProps> = ({ children, ...passThrough }) => {
    const {
        paragraphProps,
        headingProps,
        italicProps,
        anchorProps,
        boldProps
    } = passThrough;
    switch (children.type) {
        case "paragraph":
            return (
                <p {...getProps(paragraphProps, children)}>
                    <SubMarkdownRender passThrough={passThrough}>
                        {children.tokens}
                    </SubMarkdownRender>
                </p>
            );
        case "heading":
            return (
                <HeadingRender
                    headingType={children.headingType}
                    headingProps={getProps(headingProps, children)}
                >
                    <SubMarkdownRender passThrough={passThrough}>
                        {children.tokens}
                    </SubMarkdownRender>
                </HeadingRender>
            );
        case "text":
            return <>{children.content}</>;
        case "italic":
            return (
                <i {...getProps(italicProps, children)}>
                    <SubMarkdownRender passThrough={passThrough}>
                        {children.tokens}
                    </SubMarkdownRender>
                </i>
            );
        case "anchor":
            const aProps: AnchorProps = {
                href: children.href,
                ...getProps(anchorProps, children)
            };
            return (
                <a {...aProps}>
                    <SubMarkdownRender passThrough={passThrough}>
                        {children.tokens}
                    </SubMarkdownRender>
                </a>
            );
        case "bold":
            return (
                <b {...getProps(boldProps, children)}>
                    <SubMarkdownRender passThrough={passThrough}>
                        {children.tokens}
                    </SubMarkdownRender>
                </b>
            );
        default:
            throw "";
    }
};

interface SubMarkdownRenderProps {
    passThrough: Omit<MarkdownRenderProps, "children">;
    children: MarkdownToken[];
}

const SubMarkdownRender: React.VFC<SubMarkdownRenderProps> = ({ children, passThrough }) => {
    return (
        <>
            {children.map((token, index) => {
                return (
                    <TokenRender
                        key={index}
                        {...passThrough}
                    >
                        {token}
                    </TokenRender>
                );
            })}
        </>
    );
};

export const MarkdownRender: React.VFC<MarkdownRenderProps> = ({ children, ...passThrough }) => {
    return (
        <SubMarkdownRender passThrough={passThrough}>
            {Array.isArray(children) ? children : [children]}
        </SubMarkdownRender>
    );
};