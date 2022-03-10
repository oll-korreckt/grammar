import { HTMLObject, HTMLObjectMap, HTMLObjectType } from "@lib/utils";
import React, { useContext } from "react";
import { HTMLObjectRenderContext, GenericHTMLObjectComponent, HTMLObjectComponentProps, ElementPropsGetter, HTMLObjectComponent } from "./types";


export const Blockquote: GenericHTMLObjectComponent<"blockquote"> = ({ children, ...props }) => (
    <blockquote {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </blockquote>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Br: GenericHTMLObjectComponent<"br"> = ({ children, ...props }) => (
    <br {...props}/>
);

export const Code: GenericHTMLObjectComponent<"code"> = ({ children, ...props }) => (
    <code {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </code>
);

export const Del: GenericHTMLObjectComponent<"del"> = ({ children, ...props }) => (
    <del {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </del>
);

export const Italic: GenericHTMLObjectComponent<"i"> = ({ children, ...props }) => (
    <i {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </i>
);

export const H1: GenericHTMLObjectComponent<"h1"> = ({ children, ...props }) => (
    <h1 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h1>
);

export const H2: GenericHTMLObjectComponent<"h2"> = ({ children, ...props }) => (
    <h2 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h2>
);

export const H3: GenericHTMLObjectComponent<"h3"> = ({ children, ...props }) => (
    <h3 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h3>
);

export const H4: GenericHTMLObjectComponent<"h4"> = ({ children, ...props }) => (
    <h4 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h4>
);

export const H5: GenericHTMLObjectComponent<"h5"> = ({ children, ...props }) => (
    <h5 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h5>
);

export const H6: GenericHTMLObjectComponent<"h6"> = ({ children, ...props }) => (
    <h6 {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </h6>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Hr: GenericHTMLObjectComponent<"hr"> = ({ children, ...props}) => (
    <hr {...props}/>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Image: GenericHTMLObjectComponent<"img"> = ({ children, ...props }) => (
    <img {...props}/>
);

export const Anchor: GenericHTMLObjectComponent<"a"> = ({ children, ...props }) => (
    <a {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </a>
);

export const Table: GenericHTMLObjectComponent<"table"> = ({ children, ...props }) => (
    <table {...props}>
        <RenderFragment>
            {children.head}
        </RenderFragment>
        <RenderFragment>
            {children.body}
        </RenderFragment>
    </table>
);

export const TableHead: GenericHTMLObjectComponent<"thead"> = ({ children, ...props }) => (
    <thead {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </thead>
);

export const TableBody: GenericHTMLObjectComponent<"tbody"> = ({ children, ...props }) => (
    <tbody {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </tbody>
);

export const TableRow: GenericHTMLObjectComponent<"tr"> = ({ children, ...props }) => (
    <tr {...props}>
        <RenderFragment>
            {children.cells}
        </RenderFragment>
    </tr>
);

export const TableHeading: GenericHTMLObjectComponent<"th"> = ({ children, ...props }) => (
    <th {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </th>
);

export const TableData: GenericHTMLObjectComponent<"td"> = ({ children, ...props }) => (
    <td {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </td>
);

export const OrderedList: GenericHTMLObjectComponent<"ol"> = ({ children, ...props }) => (
    <ol {...props}>
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ol>
);

export const UnorderedList: GenericHTMLObjectComponent<"ul"> = ({ children, ...props }) => (
    <ul {...props}>
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ul>
);

export const TaskList: GenericHTMLObjectComponent<"tasklist"> = ({ children, ...props }) => (
    <ul {...props}>
        <RenderFragment>
            {children.items}
        </RenderFragment>
    </ul>
);

export const ListItem: GenericHTMLObjectComponent<"li"> = ({ children, ...props }) => (
    <li {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </li>
);

export const Paragraph: GenericHTMLObjectComponent<"p"> = ({ children, ...props }) => (
    <p {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </p>
);

export const Bold: GenericHTMLObjectComponent<"b"> = ({ children, ...props }) => (
    <b {...props}>
        <RenderFragment>
            {children.content}
        </RenderFragment>
    </b>
);

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const Checkbox: GenericHTMLObjectComponent<"checkbox"> = ({ children, ...props }) => (
    <input {...props}/>
);

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
        DefaultComponent: Blockquote
    },
    br: {
        DefaultComponent: Br
    },
    code: {
        DefaultComponent: Code
    },
    del: {
        DefaultComponent: Del
    },
    i: {
        DefaultComponent: Italic
    },
    h1: {
        DefaultComponent: H1
    },
    h2: {
        DefaultComponent: H2
    },
    h3: {
        DefaultComponent: H3
    },
    h4: {
        DefaultComponent: H4
    },
    h5: {
        DefaultComponent: H5
    },
    h6: {
        DefaultComponent: H6
    },
    hr: {
        DefaultComponent: Hr
    },
    img: {
        DefaultComponent: Image,
        optionalProps: {
            src: ({ src }) => src,
            alt: ({ alt }) => alt
        }
    },
    a: {
        DefaultComponent: Anchor,
        optionalProps: {
            href: ({ href }) => href
        }
    },
    table: {
        DefaultComponent: Table
    },
    th: {
        DefaultComponent: TableHeading,
        optionalProps: {
            align: ({ align }) => align
        }
    },
    thead: {
        DefaultComponent: TableHead
    },
    tbody: {
        DefaultComponent: TableBody
    },
    tr: {
        DefaultComponent: TableRow
    },
    td: {
        DefaultComponent: TableData
    },
    ol: {
        DefaultComponent: OrderedList
    },
    ul: {
        DefaultComponent: UnorderedList
    },
    tasklist: {
        DefaultComponent: TaskList
    },
    li: {
        DefaultComponent: ListItem
    },
    p: {
        DefaultComponent: Paragraph
    },
    b: {
        DefaultComponent: Bold
    },
    checkbox: {
        DefaultComponent: Checkbox,
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