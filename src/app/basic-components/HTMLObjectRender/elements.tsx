import { makeRefComponent } from "@app/utils/hoc";
import { HTMLObject, HTMLObjectMap, HTMLObjectType } from "@lib/utils";
import React, { useContext } from "react";
import { HTMLObjectRenderContext, GenericHTMLObjectComponent, HTMLObjectComponentProps, ElementPropsGetter, HTMLObjectComponent } from "./types";

export const Blockquote = makeRefComponent<HTMLQuoteElement, HTMLObjectComponentProps<"blockquote">>("Blockquote", ({ children, ...props }, ref) => (
    <blockquote
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </blockquote>
));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Br = makeRefComponent<HTMLBRElement, HTMLObjectComponentProps<"br">>("Br", ({ children, ...props }, ref) => (
    <br
        ref={ref}
        {...props}
    />
));

export const Code = makeRefComponent<HTMLElement, HTMLObjectComponentProps<"code">>("Code", ({ children, ...props }, ref) => (
    <code
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </code>
));

export const Del = makeRefComponent<HTMLModElement, HTMLObjectComponentProps<"del">>("Del", ({ children, ...props }, ref) => (
    <del
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </del>
));

export const Italic = makeRefComponent<HTMLElement, HTMLObjectComponentProps<"i">>("Italic", ({ children, ...props }, ref) => (
    <i
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </i>
));

export const H1 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h1">>("H1", ({ children, ...props }, ref) => (
    <h1
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h1>
));

export const H2 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h2">>("H2", ({ children, ...props }, ref) => (
    <h2
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h2>
));

export const H3 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h3">>("H3", ({ children, ...props }, ref) => (
    <h3
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h3>
));

export const H4 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h4">>("H4", ({ children, ...props }, ref) => (
    <h4
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h4>
));

export const H5 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h5">>("H5", ({ children, ...props }, ref) => (
    <h5
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h5>
));

export const H6 = makeRefComponent<HTMLHeadingElement, HTMLObjectComponentProps<"h6">>("H6", ({ children, ...props }, ref) => (
    <h6
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h6>
));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Hr = makeRefComponent<HTMLHRElement, HTMLObjectComponentProps<"hr">>("Hr", ({ children, ...props }, ref) => (
    <hr
        ref={ref}
        {...props}
    />
));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Image = makeRefComponent<HTMLImageElement, HTMLObjectComponentProps<"img">>("Image", ({ children, ...props }, ref) => (
    <img
        ref={ref}
        {...props}
    />
));

export const Anchor = makeRefComponent<HTMLAnchorElement, HTMLObjectComponentProps<"a">>("Anchor", ({ children, ...props }, ref) => (
    <a
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </a>
));

export const Table = makeRefComponent<HTMLTableElement, HTMLObjectComponentProps<"table">>("Table", ({ children, ...props }, ref) => (
    <table
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.head}
        </RenderFragment>
        <RenderFragment>
            {children.body}
        </RenderFragment>
    </table>
));

export const TableHead = makeRefComponent<HTMLTableSectionElement, HTMLObjectComponentProps<"thead">>("TableHead", ({ children, ...props }, ref) => (
    <thead
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </thead>
));

export const TableBody = makeRefComponent<HTMLTableSectionElement, HTMLObjectComponentProps<"tbody">>("TableBody", ({ children, ...props }, ref) => (
    <tbody
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </tbody>
));

export const TableRow = makeRefComponent<HTMLTableRowElement, HTMLObjectComponentProps<"tr">>("TableRow", ({ children, ...props }, ref) => (
    <tr
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.cells}
        </RenderFragment>
    </tr>
));

export const TableHeading = makeRefComponent<HTMLTableCellElement, HTMLObjectComponentProps<"th">>("TableHeading", ({ children, ...props }, ref) => (
    <th
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </th>
));

export const TableData = makeRefComponent<HTMLTableCellElement, HTMLObjectComponentProps<"td">>("TableData", ({ children, ...props }, ref) => (
    <td
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </td>
));

export const OrderedList = makeRefComponent<HTMLOListElement, HTMLObjectComponentProps<"ol">>("OrderedList", ({ children, ...props }, ref) => (
    <ol
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ol>
));

export const UnorderedList = makeRefComponent<HTMLUListElement, HTMLObjectComponentProps<"ul">>("UnorderedList", ({ children, ...props }, ref) => (
    <ul
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ul>
));

export const TaskList = makeRefComponent<HTMLUListElement, HTMLObjectComponentProps<"ul">>("TaskList", ({ children, ...props }, ref) => (
    <ul
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ul>
));


export const ListItem = makeRefComponent<HTMLLIElement, HTMLObjectComponentProps<"li">>("ListItem", ({ children, ...props }, ref) => (
    <li
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </li>
));

export const Paragraph = makeRefComponent<HTMLParagraphElement, HTMLObjectComponentProps<"p">>("Paragraph", ({ children, ...props }, ref) => (
    <p
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </p>
));

export const Bold = makeRefComponent<HTMLElement, HTMLObjectComponentProps<"b">>("Bold", ({ children, ...props }, ref) => (
    <b
        ref={ref}
        {...props}
    >
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </b>
));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Checkbox = makeRefComponent<HTMLInputElement, HTMLObjectComponentProps<"checkbox">>("Checkbox", ({ children, ...props }, ref) => (
    <input
        ref={ref}
        {...props}
    />
));

export const RenderFragment: React.VFC<{ children?: HTMLObject | HTMLObject[]; }> = ({ children }) => {
    const htmlObjs: HTMLObject[] = children !== undefined
        ? Array.isArray(children)
            ? children
            : [children]
        : [];
    return (
        <>
            {htmlObjs.map((htmlObj, index) => (
                <RenderFragmentItem key={index}>
                    {htmlObj}
                </RenderFragmentItem>
            ))}
        </>
    );
};

type RenderUtilityObject = {
    blockquote: RenderUtilityObjectValue<"blockquote">;
    br: RenderUtilityObjectValue<"br">;
    code: RenderUtilityObjectValue<"code">;
    del: RenderUtilityObjectValue<"del">;
    i: RenderUtilityObjectValue<"i">;
    h1: RenderUtilityObjectValue<"h1">;
    h2: RenderUtilityObjectValue<"h2">;
    h3: RenderUtilityObjectValue<"h3">;
    h4: RenderUtilityObjectValue<"h4">;
    h5: RenderUtilityObjectValue<"h5">;
    h6: RenderUtilityObjectValue<"h6">;
    hr: RenderUtilityObjectValue<"hr">;
    img: RenderUtilityObjectValue<"img"> & OptionalProps<"img", "src" | "alt">;
    a: RenderUtilityObjectValue<"a"> & OptionalProps<"a", "href">;
    table: RenderUtilityObjectValue<"table">;
    thead: RenderUtilityObjectValue<"thead">;
    tbody: RenderUtilityObjectValue<"tbody">;
    tr: RenderUtilityObjectValue<"tr">;
    th: RenderUtilityObjectValue<"th"> & OptionalProps<"th", "align">;
    td: RenderUtilityObjectValue<"td">;
    ol: RenderUtilityObjectValue<"ol">;
    ul: RenderUtilityObjectValue<"ul">;
    tasklist: RenderUtilityObjectValue<"tasklist">;
    li: RenderUtilityObjectValue<"li">;
    p: RenderUtilityObjectValue<"p">;
    b: RenderUtilityObjectValue<"b">;
    checkbox: RenderUtilityObjectValue<"checkbox"> & OptionalProps<"checkbox", "checked"> & MandatoryProps<"checkbox", "type">;
};

type RenderUtilityObjectValue<Type extends HTMLObjectType> = {
    DefaultComponent: GenericHTMLObjectComponent<Type>;
};

type OptionalProps<Type extends HTMLObjectType, TKey extends keyof HTMLObjectComponentProps<Type>> = {
    optionalProps: PropExtractorObject<Type, TKey>;
};

type MandatoryProps<Type extends HTMLObjectType, TKey extends keyof HTMLObjectComponentProps<Type>> = {
    mandatoryProps: PropExtractorObject<Type, TKey>;
};

type PropExtractorObject<Type extends HTMLObjectType, TKey extends keyof HTMLObjectComponentProps<Type>> =
    Record<TKey, PropExtractorFunction<Type, TKey>>;

type PropExtractorFunction<Type extends HTMLObjectType, Key extends keyof HTMLObjectComponentProps<Type>> = (htmlObj: HTMLObjectMap<Type>) => HTMLObjectComponentProps<Type>[Key];

const renderUtilObj: RenderUtilityObject = {
    blockquote: {
        DefaultComponent: Blockquote as any
    },
    br: {
        DefaultComponent: Br as any
    },
    code: {
        DefaultComponent: Code as any
    },
    del: {
        DefaultComponent: Del as any
    },
    i: {
        DefaultComponent: Italic as any
    },
    h1: {
        DefaultComponent: H1 as any
    },
    h2: {
        DefaultComponent: H2 as any
    },
    h3: {
        DefaultComponent: H3 as any
    },
    h4: {
        DefaultComponent: H4 as any
    },
    h5: {
        DefaultComponent: H5 as any
    },
    h6: {
        DefaultComponent: H6 as any
    },
    hr: {
        DefaultComponent: Hr as any
    },
    img: {
        DefaultComponent: Image as any,
        optionalProps: {
            src: ({ src }) => src,
            alt: ({ alt }) => alt
        }
    },
    a: {
        DefaultComponent: Anchor as any,
        optionalProps: {
            href: ({ href }) => href
        }
    },
    table: {
        DefaultComponent: Table as any
    },
    th: {
        DefaultComponent: TableHeading as any,
        optionalProps: {
            align: ({ align }) => align
        }
    },
    thead: {
        DefaultComponent: TableHead as any
    },
    tbody: {
        DefaultComponent: TableBody as any
    },
    tr: {
        DefaultComponent: TableRow as any
    },
    td: {
        DefaultComponent: TableData as any
    },
    ol: {
        DefaultComponent: OrderedList as any
    },
    ul: {
        DefaultComponent: UnorderedList as any
    },
    tasklist: {
        DefaultComponent: TaskList as any
    },
    li: {
        DefaultComponent: ListItem as any
    },
    p: {
        DefaultComponent: Paragraph as any
    },
    b: {
        DefaultComponent: Bold as any
    },
    checkbox: {
        DefaultComponent: Checkbox as any,
        optionalProps: {
            checked: ({ checked }) => checked
        },
        mandatoryProps: {
            type: () => "checkbox"
        }
    }
};

type ExtractProps = {
    customProps?: ElementPropsGetter;
    customCmpt?: HTMLObjectComponent;
}

function extractObjectProps(type: HTMLObjectType, props: HTMLObjectRenderContext): ExtractProps {
    const propsGetterKey = `${type}Props`;
    const cmptKey = `${type}Cmpt`;
    const output: ExtractProps = {};
    if (propsGetterKey in props) {
        output.customProps = (props as any)[propsGetterKey];
    }
    if (cmptKey in props) {
        output.customCmpt = (props as any)[cmptKey];
    }
    return output;
}

function runPropsGetter(obj: HTMLObject, propsGetter: ElementPropsGetter | undefined): Record<string, any> {
    switch (typeof propsGetter) {
        case "object":
            return propsGetter;
        case "undefined":
            return {};
    }
    const output = propsGetter(obj);
    return output !== undefined ? output : {};
}

const RenderFragmentItem: React.VFC<{ children: HTMLObject; }> = ({ children }) => {
    const ctx = useContext(HTMLObjectRenderContext);

    switch (typeof children) {
        case "string":
        case "undefined":
            return <>{children}</>;
    }
    const { customProps, customCmpt } = extractObjectProps(children.type, ctx);
    const props = runPropsGetter(children, customProps);
    const utils = renderUtilObj[children.type];
    if ("optionalProps" in utils) {
        Object.entries(utils.optionalProps).forEach(([key, value]) => {
            if (!(key in props)) {
                const propValue = value(children);
                if (propValue !== undefined) {
                    props[key] = propValue;
                }
            }
        });
    }
    if ("mandatoryProps" in utils) {
        Object.entries(utils.mandatoryProps).forEach(([key, value]) => {
            props[key] = value(children as any);
        });
    }
    const Component: any = customCmpt !== undefined
        ? customCmpt : utils.DefaultComponent;
    return (
        <Component {...props}>
            {children}
        </Component>
    );
};