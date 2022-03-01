import { HTMLAnchorObject, HTMLBlockquoteObject, HTMLBoldObject, HTMLBrObject, HTMLCheckboxObject, HTMLCodeObject, HTMLDelObject, HTMLH1Object, HTMLH2Object, HTMLH3Object, HTMLH4Object, HTMLH5Object, HTMLH6Object, HTMLHrObject, HTMLImageObject, HTMLItalicObject, HTMLListItemObject, HTMLObject, HTMLOrderedListObject, HTMLParagraphObject, HTMLTableDataObject, HTMLTableHeaderObject, HTMLTableObject, HTMLTableRowObject, HTMLTaskListObject, HTMLUnorderedListObject } from "@lib/utils";
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
    tableRowProps?: ElementProps<HTMLTableRowObject, TableRowProps>;
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

type ElementProps<THTMLObject extends HTMLObject, Props extends PropertyTypes> =
    | Props
    | ElementPropsFunction<THTMLObject, Props>
type ElementPropsFunction<THTMLObject extends HTMLObject, Props extends PropertyTypes> = (htmlObj: THTMLObject) => Props;
type HTMLOmit<ElementType extends HTMLElement, Keys extends keyof ElementType> = Omit<DetailedHTMLProps<HTMLAttributes<ElementType>, ElementType>, Keys>;
type ChildlessElementProps<T extends HTMLElement = HTMLElement> = HTMLOmit<T, "children">;

type PropertyTypes =
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
export type BlockquoteProps = ChildlessElementProps;
export type BrProps = ChildlessElementProps<HTMLBRElement>;
export type CodeProps = ChildlessElementProps;
export type DelProps = ChildlessElementProps;
export type ItalicProps = ChildlessElementProps;
type HeadingProps = ChildlessElementProps<HTMLHeadingElement>;
export type H1Props = HeadingProps;
export type H2Props = HeadingProps;
export type H3Props = HeadingProps;
export type H4Props = HeadingProps;
export type H5Props = HeadingProps;
export type H6Props = HeadingProps;
export type HrProps = ChildlessElementProps<HTMLHRElement>;
export type ImageProps = HTMLOmit<HTMLImageElement, "children" | "src" | "alt">;
export type AnchorProps = HTMLOmit<HTMLAnchorElement, "children" | "href">;
export type TableProps = ChildlessElementProps<HTMLTableElement>;
type TableCellProps = HTMLOmit<HTMLTableCellElement, "children" | "align">;
export type TableHeaderProps = TableCellProps;
export type TableRowProps = HTMLOmit<HTMLTableRowElement, "children" | "align">;
export type TableDataProps = TableCellProps;
export type OrderedListProps = ChildlessElementProps<HTMLOListElement>;
export type UnorderedListProps = ChildlessElementProps<HTMLUListElement>;
export type TaskListProps = UnorderedListProps;
export type ListItemProps = ChildlessElementProps<HTMLLIElement>;
export type ParagraphProps = ChildlessElementProps<HTMLParagraphElement>;
export type BoldProps = ChildlessElementProps;
export type CheckboxProps = HTMLOmit<HTMLInputElement, "type" | "checked">;

interface ContentRenderProps extends Omit<SubComponentProps, "children"> {
    children: HTMLObject;
}

function getProps<THTMLObject extends HTMLObject, TProps extends PropertyTypes>(props: ElementProps<THTMLObject, TProps> | undefined, obj: THTMLObject): TProps {
    switch (typeof props) {
        case "object":
            return props;
        case "function":
            return props(obj);
        case "undefined":
            return {} as TProps;
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
    switch (children.type) {
        case "blockquote":
            return (
                <blockquote {...getProps(blockquoteProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </blockquote>
            );
        case "br":
            return <br {...getProps(brProps, children)}/>;
        case "code":
            return (
                <code {...getProps(codeProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </code>
            );
        case "del":
            return (
                <del {...getProps(delProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </del>
            );
        case "i":
            return (
                <i {...getProps(italicProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </i>
            );
        case "h1":
            return (
                <h1 {...getProps(h1Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h1>
            );
        case "h2":
            return (
                <h2 {...getProps(h2Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h2>
            );
        case "h3":
            return (
                <h3 {...getProps(h3Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h3>
            );
        case "h4":
            return (
                <h4 {...getProps(h4Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h4>
            );
        case "h5":
            return (
                <h5 {...getProps(h5Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h5>
            );
        case "h6":
            return (
                <h6 {...getProps(h6Props, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </h6>
            );
        case "hr":
            return <hr {...getProps(hrProps, children)}/>;
        case "img":
            return (
                <img
                    src={children.src}
                    alt={children.alt}
                    {...getProps(imageProps, children)}
                />
            );
        case "a":
            return (
                <a
                    href={children.href}
                    {...getProps(anchorProps, children)}
                >
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </a>
            );
        case "ol":
            return (
                <ol {...getProps(orderedListProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.items}
                    </SubComponent>
                </ol>
            );
        case "ul":
            return (
                <ul {...getProps(unorderedListProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.items}
                    </SubComponent>
                </ul>
            );
        case "tasklist":
            return (
                <ul {...getProps(taskListProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.items}
                    </SubComponent>
                </ul>
            );
        case "li":
            return (
                <li {...getProps(listItemProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </li>
            );
        case "table":
            return (
                <table {...getProps(tableProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.headers}
                    </SubComponent>
                    <SubComponent passThrough={passThrough}>
                        {children.rows}
                    </SubComponent>
                </table>
            );
        case "tr": {
            return (
                <tr {...getProps(tableRowProps, children as any)}>
                    <SubComponent passThrough={passThrough}>
                        {children.cells}
                    </SubComponent>
                </tr>
            );
        }
        case "th":
            const alignProp: any = {};
            if (children.align !== undefined) {
                alignProp.align = children.align;
            }
            return (
                <th
                    {...alignProp}
                    {...getProps(tableHeaderProps, children)}
                >
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </th>
            );
        case "td":
            return (
                <td {...getProps(tableDataProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </td>
            );
        case "p":
            return (
                <p {...getProps(paragraphProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </p>
            );
        case "b":
            return (
                <b {...getProps(boldProps, children)}>
                    <SubComponent passThrough={passThrough}>
                        {children.content}
                    </SubComponent>
                </b>
            );
        case "checkbox":
            return (
                <input
                    type="checkbox"
                    checked={children.checked}
                    {...getProps(checkboxProps, children)}
                />
            );
    }
};

interface SubComponentProps {
    passThrough: Omit<HTMLObjectRenderProps, "children">;
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