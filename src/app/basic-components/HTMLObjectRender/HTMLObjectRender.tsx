import { HTMLAnchorObject, HTMLBlockquoteObject, HTMLBoldObject, HTMLBrObject, HTMLCheckboxObject, HTMLCodeObject, HTMLContent, HTMLDelObject, HTMLH1Object, HTMLH2Object, HTMLH3Object, HTMLH4Object, HTMLH5Object, HTMLH6Object, HTMLHrObject, HTMLImageObject, HTMLItalicObject, HTMLListItemObject, HTMLObject, HTMLOrderedListObject, HTMLParagraphObject, HTMLTableDataObject, HTMLTableHeaderObject, HTMLTableObject, HTMLTableRowObject, HTMLTaskListObject, HTMLUnorderedListObject } from "@lib/utils";
import React, { DetailedHTMLProps, HTMLAttributes } from "react";

export interface HTMLObjectRenderProps {
    blockquoteProps?: ElementProps<HTMLBlockquoteObject, BlockquoteProps>;
    brProps?: ElementProps<HTMLBrObject, BrProps>;
    codeProps?: ElementProps<HTMLCodeObject, CodeProps>;
    delProps?: ElementProps<HTMLDelObject, DelProps>;
    italicProps?: ElementProps<HTMLItalicObject, ItalicProps>;
    h1Props?: ElementProps<HTMLH1Object, H1Props>;
    h2Props?: ElementProps<HTMLH2Object, H2Props>;
    h3Props?: ElementProps<HTMLH3Object, H3Props>;
    h4Props?: ElementProps<HTMLH4Object, H4Props>;
    h5Props?: ElementProps<HTMLH5Object, H5Props>;
    h6Props?: ElementProps<HTMLH6Object, H6Props>;
    hrProps?: ElementProps<HTMLHrObject, HrProps>;
    imageProps?: ElementProps<HTMLImageObject, ImageProps>;
    anchorProps?: ElementProps<HTMLAnchorObject, AnchorProps>;
    tableProps?: ElementProps<HTMLTableObject, TableProps>;
    tableHeaderProps?: ElementProps<HTMLTableHeaderObject, TableHeaderProps>;
    tableHeaderRowProps?: ElementProps<HTMLTableRowObject<"header">, TableHeaderProps>;
    tableRowProps?: ElementProps<HTMLTableRowObject<"data">, TableRowProps>;
    tableDataProps?: ElementProps<HTMLTableDataObject, TableDataProps>;
    orderedListProps?: ElementProps<HTMLOrderedListObject, OrderedListProps>;
    unorderedListProps?: ElementProps<HTMLUnorderedListObject, UnorderedListProps>;
    taskListProps?: ElementProps<HTMLTaskListObject, TaskListProps>;
    listItemProps?: ElementProps<HTMLListItemObject, ListItemProps>;
    paragraphProps?: ElementProps<HTMLParagraphObject, ParagraphProps>;
    boldProps?: ElementProps<HTMLBoldObject, BoldProps>;
    checkboxProps?: ElementProps<HTMLCheckboxObject, CheckboxProps>;
    children: HTMLObject | HTMLObject[];
}

type ElementProps<THTMLObject extends HTMLObject, Props extends PropertyType> =
    | Props
    | ElementPropsFunction<THTMLObject, Props>
type ElementPropsFunction<THTMLObject extends HTMLObject, Props extends PropertyType> = (htmlObj: THTMLObject) => void | Props | undefined;
type ElementPropsAlias<T extends HTMLElement = HTMLElement> = DetailedHTMLProps<HTMLAttributes<T>, T>;

type PropertyType =
    | BlockquoteProps
    | BrProps
    | CodeProps
    | DelProps
    | ItalicProps
    | H1Props
    | H2Props
    | H3Props
    | H4Props
    | H5Props
    | H6Props
    | HrProps
    | ImageProps
    | AnchorProps
    | TableProps
    | TableHeaderProps
    | TableRowProps
    | TableDataProps
    | OrderedListProps
    | UnorderedListProps
    | TaskListProps
    | ListItemProps
    | ParagraphProps
    | BoldProps
    | CheckboxProps
export type BlockquoteProps = ElementPropsAlias;
export type BrProps = ElementPropsAlias<HTMLBRElement>;
export type CodeProps = ElementPropsAlias;
export type DelProps = ElementPropsAlias;
export type ItalicProps = ElementPropsAlias;
type HeadingProps = ElementPropsAlias<HTMLHeadingElement>;
export type H1Props = HeadingProps;
export type H2Props = HeadingProps;
export type H3Props = HeadingProps;
export type H4Props = HeadingProps;
export type H5Props = HeadingProps;
export type H6Props = HeadingProps;
export type HrProps = ElementPropsAlias<HTMLHRElement>;
export type ImageProps = ElementPropsAlias<HTMLImageElement>;
export type AnchorProps = ElementPropsAlias<HTMLAnchorElement>;
export type TableProps = ElementPropsAlias<HTMLTableElement>;
type TableCellProps = ElementPropsAlias<HTMLTableCellElement>;
export type TableHeaderProps = TableCellProps;
export type TableRowProps = ElementPropsAlias<HTMLTableRowElement>;
export type TableDataProps = TableCellProps;
export type OrderedListProps = ElementPropsAlias<HTMLOListElement>;
export type UnorderedListProps = ElementPropsAlias<HTMLUListElement>;
export type TaskListProps = UnorderedListProps;
export type ListItemProps = ElementPropsAlias<HTMLLIElement>;
export type ParagraphProps = ElementPropsAlias<HTMLParagraphElement>;
export type BoldProps = ElementPropsAlias;
export type CheckboxProps = ElementPropsAlias<HTMLInputElement>;

interface ContentRenderProps extends Omit<SubComponentProps, "children"> {
    children: HTMLObject;
}

type RawProps = Record<string, any>;
type PropsFunction = (data: HTMLObject) => Record<string, any> | undefined;


function createElement(tag: keyof React.ReactHTML, props: RawProps | PropsFunction | undefined, data: HTMLObject, passThrough: PassThroughProps, content?: HTMLContent): React.ReactElement<any, any> {
    const elementProps = getProps(props, data);
    if (content !== undefined && !("children" in elementProps)) {
        elementProps.children = React.createElement(
            SubComponent,
            { passThrough },
            content
        );
    }
    return React.createElement(tag, elementProps);
}

function overrideProps<Type extends HTMLObject>(props: RawProps | PropsFunction | undefined, overrideFn: (data: Type) => RawProps): PropsFunction {
    return (data) => {
        const props1 = overrideFn(data as any);
        const props2 = getProps(props, data);
        return {
            ...props1,
            ...props2
        };
    };
}

function getProps(props: RawProps | PropsFunction | undefined, data: HTMLObject): RawProps {
    switch (typeof props) {
        case "object":
            return props;
        case "function":
            const output = (props as PropsFunction)(data);
            return output === undefined ? {} : output;
        case "undefined":
            return {};
    }
}

const ContentRender: React.VFC<ContentRenderProps> = ({ children, passThrough }) => {
    const {
        blockquoteProps,
        brProps,
        codeProps,
        delProps,
        italicProps,
        h1Props,
        h2Props,
        h3Props,
        h4Props,
        h5Props,
        h6Props,
        hrProps,
        imageProps,
        anchorProps,
        orderedListProps,
        unorderedListProps,
        taskListProps,
        listItemProps,
        tableProps,
        tableRowProps,
        tableHeaderProps,
        tableHeaderRowProps,
        tableDataProps,
        paragraphProps,
        boldProps,
        checkboxProps
    } = passThrough;
    switch (typeof children) {
        case "string":
        case "undefined":
            return <>{children}</>;
    }
    type InvokeFn = (tag: keyof React.ReactHTML, props: RawProps | PropsFunction | undefined, content?: HTMLContent) => React.ReactElement<any, any>;
    const invokeCreateElement: InvokeFn = (tag, props, content) => {
        return createElement(tag, props, children, passThrough, content);
    };
    switch (children.type) {
        case "blockquote":
            return invokeCreateElement("blockquote", blockquoteProps, children.content);
        case "br":
            return invokeCreateElement("br", brProps);
        case "code":
            return invokeCreateElement("code", codeProps, children.content);
        case "del":
            return invokeCreateElement("del", delProps, children.content);
        case "i":
            return invokeCreateElement("i", italicProps, children.content);
        case "h1":
            return invokeCreateElement("h1", h1Props, children.content);
        case "h2":
            return invokeCreateElement("h2", h2Props, children.content);
        case "h3":
            return invokeCreateElement("h3", h3Props, children.content);
        case "h4":
            return invokeCreateElement("h4", h4Props, children.content);
        case "h5":
            return invokeCreateElement("h5", h5Props, children.content);
        case "h6":
            return invokeCreateElement("h6", h6Props, children.content);
        case "hr":
            return invokeCreateElement("hr", hrProps);
        case "img": {
            const newProps = overrideProps<HTMLImageObject>(
                imageProps,
                ({ src, alt }) => { return { src, alt }; }
            );
            return invokeCreateElement("img", newProps);
        }
        case "a": {
            const newProps = overrideProps<HTMLAnchorObject>(
                anchorProps,
                ({ href }) => { return { href }; }
            );
            return invokeCreateElement("a", newProps, children.content);
        }
        case "ol":
            return invokeCreateElement("ol", orderedListProps, children.items);
        case "ul":
            return invokeCreateElement("ul", unorderedListProps, children.items);
        case "tasklist":
            return invokeCreateElement("ul", taskListProps, children.items);
        case "li":
            return invokeCreateElement("li", listItemProps, children.content);
        case "table": {
            const props = getProps(tableProps, children);
            return (
                <table {...props}>
                    <thead>
                        <SubComponent passThrough={passThrough}>
                            {children.headers}
                        </SubComponent>
                    </thead>
                    <tbody>
                        <SubComponent passThrough={passThrough}>
                            {children.rows}
                        </SubComponent>
                    </tbody>
                </table>
            );
        }
        case "tr": {
            const props = "header" in children ? tableHeaderRowProps : tableRowProps;
            return invokeCreateElement("tr", props, children.cells);
        }
        case "th": {
            const newProps = overrideProps<HTMLTableHeaderObject>(
                tableHeaderProps,
                ({ align }) => { return align === undefined ? {} : { align }; }
            );
            return invokeCreateElement("th", newProps, children.content);
        }
        case "td": {
            return invokeCreateElement("td", tableDataProps, children.content);
        }
        case "p":
            return invokeCreateElement("p", paragraphProps, children.content);
        case "b":
            return invokeCreateElement("b", boldProps, children.content);
        case "checkbox":
            const newProps = overrideProps<HTMLCheckboxObject>(
                checkboxProps,
                ({ checked }) => {
                    const output: Record<string, any> = { type: "checkbox" };
                    if (checked) {
                        output.checked = checked;
                    }
                    return output;
                }
            );
            return invokeCreateElement("input", newProps);
    }
};

type PassThroughProps = Omit<HTMLObjectRenderProps, "children">;

interface SubComponentProps {
    passThrough: PassThroughProps;
    children?: HTMLObject | HTMLObject[];
}

const SubComponent: React.VFC<SubComponentProps> = ({ children, passThrough }) => {
    const htmlObjs: HTMLObject[] = children !== undefined
        ? Array.isArray(children)
            ? children
            : [children]
        : [];
    return (
        <>
            {htmlObjs.map((htmlObj, index) => (
                <ContentRender
                    key={index}
                    passThrough={passThrough}
                >
                    {htmlObj}
                </ContentRender>
            ))}
        </>
    );
};

export const HTMLObjectRender: React.VFC<HTMLObjectRenderProps> = ({ children, ...passThrough }) => {
    return (
        <SubComponent passThrough={passThrough}>
            {children}
        </SubComponent>
    );
};