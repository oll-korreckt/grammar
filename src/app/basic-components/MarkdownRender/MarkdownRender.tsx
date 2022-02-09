import { makeRefComponent } from "@app/utils/hoc";
import { HeadingType, MarkdownBold, MarkdownHeading, MarkdownItalic, MarkdownLink, MarkdownParagraph, MarkdownToken } from "@lib/utils/markdown";
import React, { DetailedHTMLProps, HTMLAttributes } from "react";

export interface MarkdownRenderProps {
    paragraphProps?: MarkdownElementProps<ParagraphProps, MarkdownParagraph>;
    italicProps?: MarkdownElementProps<ItalicProps, MarkdownItalic>;
    headingProps?: MarkdownElementProps<HeadingProps, MarkdownHeading>;
    linkProps?: MarkdownElementProps<LinkProps, MarkdownLink>;
    boldProps?: MarkdownElementProps<BoldProps, MarkdownBold>;
    children: MarkdownToken[];
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
    | LinkProps
    | BoldProps;
export type ParagraphProps = ChildlessElementProps<HTMLParagraphElement>;
export type ItalicProps = ChildlessElementProps<HTMLElement>;
export type HeadingProps = ChildlessElementProps<HTMLHeadingElement>;
export type LinkProps = Omit<DetailedHTMLProps<React.AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>, "children">;
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

const HeadingRender: React.FC<{ headingType: HeadingType; headerProps: HeadingProps; }> = ({ children, headingType, headerProps }) => {
    switch (headingType) {
        case 1:
            return <h1 {...headerProps}>{children}</h1>;
        case 2:
            return <h2 {...headerProps}>{children}</h2>;
        case 3:
            return <h3 {...headerProps}>{children}</h3>;
        case 4:
            return <h4 {...headerProps}>{children}</h4>;
        case 5:
            return <h5 {...headerProps}>{children}</h5>;
        case 6:
            return <h6 {...headerProps}>{children}</h6>;
        default:
            throw "";
    }
};

const TokenRender: React.VFC<TokenRenderProps> = ({ children, ...passThrough }) => {
    const {
        paragraphProps,
        headingProps,
        italicProps,
        linkProps,
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
                    headerProps={getProps(headingProps, children)}
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
        case "link":
            const aProps: LinkProps = {
                href: children.link,
                ...getProps(linkProps, children)
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

export const MarkdownRender = makeRefComponent<HTMLDivElement, MarkdownRenderProps>("MarkdownRender", ({ children, ...passThrough }, ref) => {
    return (
        <div ref={ref}>
            <SubMarkdownRender passThrough={passThrough}>
                {children}
            </SubMarkdownRender>
        </div>
    );
});