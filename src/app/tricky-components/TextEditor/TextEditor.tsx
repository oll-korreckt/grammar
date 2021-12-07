import { ErrorKey } from "@app/basic-components/SentenceInput/error-key";
import { Paragraph } from "@app/basic-components/SentenceInput/sub-components";
import { accessClassName, CustomText, Decorator, DecoratorRange, ErrorToken, getTextType, PlainText, RenderElement, RenderLeaf, TypedRenderLeaf, TypedRenderLeafProps } from "@app/utils";
import { extendRef, makeRefComponent } from "@app/utils/hoc";
import { scan } from "@domain/language";
import { ScannerError } from "@domain/language/scanner";
import React, { useRef, useState } from "react";
import { Descendant, Editor as SlateEditor, Node, NodeEntry, Path, Text } from "slate";
import { Editable, Slate } from "slate-react";
import styles from "./_styles.scss";

export interface TextEditorProps {
    children?: string;
    editor: SlateEditor;
    errorDelay?: number;
    editorRef?: React.Ref<HTMLDivElement>;
}

type Decorations = Record<string, DecoratorRange[]>;

const DEFAULT_DELAY = 500;

function getRanges(errors: ScannerError[], path: Path): DecoratorRange[] {
    return errors.map(({ message, start, end }, index) => {
        return {
            tokenType: "error",
            message: message,
            key: ErrorKey.init(path, index),
            anchor: { path, offset: start },
            focus: { path, offset: end }
        };
    });
}

function getTextNodes(descendents: Descendant[]): NodeEntry<CustomText>[] {
    const output: NodeEntry<CustomText>[] = [];
    descendents.forEach((descendent, index) => {
        const entries: NodeEntry<CustomText>[] = Array.from(Node.nodes(descendent))
            .filter(([node]) => Text.isText(node))
            .map(([node, relPath]) => [node, [index, ...relPath]]) as NodeEntry<CustomText>[];
        output.push(...entries);
    });
    return output;
}

const renderElement: RenderElement = (props) => {
    const { element, ...rest } = props;
    switch (element.type) {
        case "paragraph":
            return <Paragraph element={element} {...rest} />;
        default:
            throw "unhandled element type";
    }
};

const renderLeaf: RenderLeaf = (props) => {
    const { leaf, ...rest } = props;
    const text = getTextType(leaf);
    switch (text.type) {
        case "plainText":
            return <PlainTextLeaf leaf={text.data} {...rest}/>;
        case "errorToken":
            return <ErrorTokenLeaf leaf={text.data} {...rest}/>;
        default:
            throw "unhandled leaf type";
    }
};

type Updater = (descendents: Descendant[]) => void;
type DecorationStorage = Record<string, { text: string; decorations: DecoratorRange[]; }>;

function extractDecorations(storage: DecorationStorage): Decorations {
    const output: Decorations = {};
    Object.entries(storage).forEach(([key, { decorations }]) => {
        output[key] = decorations;
    });
    return output;
}

function newStorage(descendents: Descendant[], old?: DecorationStorage): DecorationStorage {
    const output: DecorationStorage = {};
    getTextNodes(descendents).forEach(([{ text }, path]) => {
        const key = ErrorKey.createPathKey(path);
        let decorations: DecoratorRange[];
        if (old !== undefined && old[key].text === text) {
            decorations = old[key].decorations;
        } else {
            const scanResult = scan(text);
            decorations = scanResult.type === "errors"
                ? getRanges(scanResult.data, path)
                : [];
        }
        output[key] = { text, decorations };
    });
    return output;
}

function useDecorations(initial: Descendant[]): [decorations: Decorations, updater: Updater] {
    const [storage, setStorage] = useState<DecorationStorage>(newStorage(initial));

    const updater: Updater = (descendents) => {
        const keys = Object.keys(storage);
        const textNodes = getTextNodes(descendents);
        if (keys.length !== textNodes.length) {
            setStorage(newStorage(descendents, storage));
            return;
        }
        const output: DecorationStorage = {};
        let applyUpdate = false;
        for (let index = 0; index < textNodes.length; index++) {
            const [{ text }, path] = textNodes[index];
            const key = ErrorKey.createPathKey(path);
            if (storage[key].text === text) {
                // no change so use value from storage
                output[key] = storage[key];
            } else {
                // diff value so must recalculate
                const scanResult = scan(text);
                const decorations = scanResult.type === "errors"
                    ? getRanges(scanResult.data, path)
                    : [];
                output[key] = { text, decorations };
                applyUpdate = true;
            }
        }
        if (applyUpdate) {
            setStorage(output);
        }
    };

    return [
        extractDecorations(storage),
        updater
    ];
}

export const TextEditor = makeRefComponent<HTMLDivElement, TextEditorProps>("Editor", ({ children, errorDelay, editor, editorRef }, ref) => {
    const timerId = useRef<any>();
    const [descendents, setDescendents] = useState<Descendant[]>([{
        type: "paragraph",
        children: [{
            text: children !== undefined ? children : ""
        }]
    }]);
    const [decorations, setDecorations] = useDecorations(descendents);
    const extendedRef = extendRef<HTMLDivElement>(ref, (instance) => {
        if (instance === null
            || instance.firstElementChild === null
            || editorRef === undefined
            || editorRef === null) {
            return;
        }

        const editorInstance = instance.firstElementChild as HTMLDivElement;
        switch (typeof editorRef) {
            case "object":
                (editorRef.current as any) = editorInstance;
                break;
            case "function":
                editorRef(editorInstance);
                break;
        }
    });

    const decorator: Decorator = ([, path]) => {
        if (path.length === 0) {
            return [];
        }
        const key = ErrorKey.createPathKey(path);
        return decorations[key] !== undefined ? decorations[key] : [];
    };

    return (
        <div
            ref={extendedRef}
            className={accessClassName(styles, "editor")}
        >
            <Slate
                editor={editor}
                value={descendents}
                onChange={(newValue) => {
                    clearTimeout(timerId.current);
                    const delay = errorDelay !== undefined
                        ? errorDelay
                        : DEFAULT_DELAY;
                    timerId.current = setTimeout(() => {
                        setDecorations(newValue);
                    }, delay);
                    setDescendents(newValue);
                }}
            >
                <Editable
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    decorate={decorator}
                    spellCheck={false}
                />
            </Slate>
        </div>
    );
});

const PlainTextLeaf: TypedRenderLeaf<PlainText> = ({ children, attributes, leaf }) => {
    return (
        <span
            style={{
                fontWeight: leaf.bold ? "bold" : "initial"
            }}
            {...attributes}
        >
            {children}
        </span>
    );
};

const ErrorTokenLeaf: React.VFC<TypedRenderLeafProps<ErrorToken>> = ({ children, attributes, leaf }) => {
    return (
        <span
            style={{
                textDecoration: "red wavy underline",
                fontWeight: leaf.bold ? "bold" : "initial"
            }}
            {...attributes}
        >
            {children}
        </span>
    );
};