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
    tableHeaderRowProps?: ElementProps<HTMLTableHeaderObject, TableHeaderProps>;
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

type ElementProps<THTMLObject extends HTMLObject, Props extends PropertyType> =
    | Props
    | ElementPropsFunction<THTMLObject, Props>
type ElementPropsFunction<THTMLObject extends HTMLObject, Props extends PropertyType> = (htmlObj: THTMLObject) => Props;
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
type PropsFunction = (data: HTMLObject) => Record<string, any>;



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
            return props(data);
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
    switch (children.type) {
        case "blockquote":
            return createElement("blockquote", blockquoteProps, children, passThrough, children.content);
            // return (
            //     <blockquote {...getProps(blockquoteProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </blockquote>
            // );
        case "br":
            return createElement("br", brProps, children, passThrough);
            // return <br {...getProps(brProps, children)}/>;
        case "code":
            return createElement("code", codeProps, children, passThrough, children.content);
            // return (
            //     <code {...getProps(codeProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </code>
            // );
        case "del":
            return createElement("del", delProps, children, passThrough, children.content);
            // return (
            //     <del {...getProps(delProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </del>
            // );
        case "i":
            return createElement("i", italicProps, children, passThrough, children.content);
            // return (
            //     <i {...getProps(italicProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </i>
            // );
        case "h1":
            return createElement("h1", h1Props, children, passThrough, children.content);
            // return (
            //     <h1 {...getProps(h1Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h1>
            // );
        case "h2":
            return createElement("h2", h2Props, children, passThrough, children.content);
            // return (
            //     <h2 {...getProps(h2Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h2>
            // );
        case "h3":
            return createElement("h3", h3Props, children, passThrough, children.content);
            // return (
            //     <h3 {...getProps(h3Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h3>
            // );
        case "h4":
            return createElement("h4", h4Props, children, passThrough, children.content);
            // return (
            //     <h4 {...getProps(h4Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h4>
            // );
        case "h5":
            return createElement("h5", h5Props, children, passThrough, children.content);
            // return (
            //     <h5 {...getProps(h5Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h5>
            // );
        case "h6":
            return createElement("h6", h6Props, children, passThrough, children.content);
            // return (
            //     <h6 {...getProps(h6Props, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </h6>
            // );
        case "hr":
            return createElement("hr", hrProps, children, passThrough);
            // return <hr {...getProps(hrProps, children)}/>;
        case "img": {
            const newProps = overrideProps<HTMLImageObject>(
                imageProps,
                ({ src, alt }) => { return { src, alt }; }
            );
            return createElement("img", newProps, children, passThrough);
            // return (
            //     <img
            //         src={children.src}
            //         alt={children.alt}
            //         {...getProps(imageProps, children)}
            //     />
            // );
        }
        case "a": {
            const newProps = overrideProps<HTMLAnchorObject>(
                anchorProps,
                ({ href }) => { return { href }; }
            );
            return createElement("a", newProps, children, passThrough, children.content);
            // return (
            //     <a
            //         href={children.href}
            //         {...getProps(anchorProps, children)}
            //     >
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </a>
            // );
        }
        case "ol":
            return createElement("ol", orderedListProps, children, passThrough, children.items);
            // return (
            //     <ol {...getProps(orderedListProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.items}
            //         </SubComponent>
            //     </ol>
            // );
        case "ul":
            return createElement("ul", unorderedListProps, children, passThrough, children.items);
            // return (
            //     <ul {...getProps(unorderedListProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.items}
            //         </SubComponent>
            //     </ul>
            // );
        case "tasklist":
            return createElement("ul", taskListProps, children, passThrough, children.items);
            // return (
            //     <ul {...getProps(taskListProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.items}
            //         </SubComponent>
            //     </ul>
            // );
        case "li":
            return createElement("li", listItemProps, children, passThrough, children.content);
            // return (
            //     <li {...getProps(listItemProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </li>
            // );
        case "table": {
            const tableContent: HTMLObject[] = [children.headers, ...children.rows];
            return createElement("table", tableProps, children, passThrough, tableContent);
            // return (
            //     <table {...getProps(tableProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.headers}
            //         </SubComponent>
            //         <SubComponent passThrough={passThrough}>
            //             {children.rows}
            //         </SubComponent>
            //     </table>
            // );
        }
        case "tr": {
            const props = "header" in children ? tableHeaderRowProps : tableRowProps;
            return createElement("tr", props, children, passThrough, children.cells);
            // return (
            //     <tr {...getProps(tableRowProps, children as any)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.cells}
            //         </SubComponent>
            //     </tr>
            // );
        }
        case "th": {
            const newProps = overrideProps<HTMLTableHeaderObject>(
                tableHeaderProps,
                ({ align }) => { return align === undefined ? {} : { align }; }
            );
            return createElement("th", newProps, children, passThrough, children.content);
            // const alignProp: any = {};
            // if (children.align !== undefined) {
            //     alignProp.align = children.align;
            // }
            // return (
            //     <th
            //         {...alignProp}
            //         {...getProps(tableHeaderProps, children)}
            //     >
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </th>
            // );
        }
        case "td": {
            return createElement("td", tableDataProps, children, passThrough, children.content);
            // return (
            //     <td {...getProps(tableDataProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </td>
            // );
        }
        case "p":
            return createElement("p", paragraphProps, children, passThrough, children.content);
            // return (
            //     <p {...getProps(paragraphProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </p>
            // );
        case "b":
            return createElement("b", boldProps, children, passThrough, children.content);
            // return (
            //     <b {...getProps(boldProps, children)}>
            //         <SubComponent passThrough={passThrough}>
            //             {children.content}
            //         </SubComponent>
            //     </b>
            // );
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
            return createElement("input", newProps, children, passThrough);
            // return (
            //     <input
            //         type="checkbox"
            //         checked={children.checked}
            //         {...getProps(checkboxProps, children)}
            //     />
            // );
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