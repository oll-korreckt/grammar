import { ErrorKey } from "@app/tricky-components/TextEditor/error-key";
import { accessClassName, CustomText, Decorator, DecoratorRange, ErrorToken, getTextType, ParagraphElement, PlainText, RenderElement, RenderLeaf, TypedRenderElementProps, TypedRenderLeaf, TypedRenderLeafProps } from "@app/utils";
import { extendRef, makeRefComponent, mergeRefs } from "@app/utils/hoc";
import { scan } from "@domain/language";
import { ScannerError } from "@domain/language/scanner";
import { SimpleObject } from "@lib/utils";
import React, { useEffect, useRef, useState } from "react";
import { Descendant, Editor as SlateEditor, Node, NodeEntry, Path, Text } from "slate";
import { Editable, Slate } from "slate-react";
import styles from "./_styles.scss";

export interface TextEditorProps {
    children?: string;
    editor: SlateEditor;
    errorDelay?: number;
    onErrorChange?: ErrorStateChange;
    errorChangeInvoke?: ErrorChangeInvokeType;
    onInputChange?: (input: string) => void;
    onErrorDelayComplete?: () => void;
    editorRef?: React.Ref<HTMLDivElement>;
}

type ErrorChangeInvokeType = "always" | "on changes";
type ErrorStateChange = (errors: DecoratorRange[]) => void;
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
        if (old !== undefined
            && key in old
            && old[key].text === text) {
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

function useDecorations(initial: Descendant[], errorChangeInvoke: ErrorChangeInvokeType, onErrorChange: ErrorStateChange): [decorations: Decorations, updater: Updater] {
    const [storage, setStorage] = useState<DecorationStorage>(newStorage(initial));
    const decorationsOutput = extractDecorations(storage);

    function invokeSetStorage(newStorageValue: DecorationStorage): void {
        const newDecorations = extractDecorations(newStorageValue);
        if (errorChangeInvoke === "always" || !SimpleObject.deepEquals(decorationsOutput, newDecorations)) {
            const errors = extractErrors(newDecorations);
            onErrorChange(errors);
        }
        setStorage(newStorageValue);
    }

    const updater: Updater = (descendents) => {
        const keys = Object.keys(storage);
        const textNodes = getTextNodes(descendents);
        if (keys.length !== textNodes.length) {
            invokeSetStorage(newStorage(descendents, storage));
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
            invokeSetStorage(output);
        }
    };

    useEffect(() => {
        // immediately fire on first render
        onErrorChange(extractErrors(decorationsOutput));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return [
        decorationsOutput,
        updater
    ];
}

function extractErrors(decorations: Decorations): DecoratorRange[] {
    return Object.values(decorations)
        .flatMap((values) => values)
        .sort((a, b) => ErrorKey.sortMethod(a.key, b.key));
}

function initChildren(children: string | undefined): Descendant[] {
    const definedChildren = children !== undefined ? children : "";
    return definedChildren.split("\n").map((line) => {
        return {
            type: "paragraph",
            children: [{ text: line }]
        };
    });
}

function extractText(descendents: Descendant[]): string {
    let output = "";
    descendents.forEach((node, index) => {
        const text = Node.string(node);
        output += text;
        if (index < descendents.length - 1) {
            output += "\n";
        }
    });
    return output;
}

export const TextEditor = makeRefComponent<HTMLDivElement, TextEditorProps>("TextEditor", ({ children, errorDelay, errorChangeInvoke, onErrorChange, onInputChange, editor, editorRef }, ref) => {
    const timerId = useRef<any>();
    const [descendents, setDescendents] = useState<Descendant[]>(initChildren(children));
    const [decorations, setDecorations] = useDecorations(
        descendents,
        errorChangeInvoke !== undefined
            ? errorChangeInvoke
            : "on changes",
        onErrorChange !== undefined
            ? onErrorChange
            : () => { return; }
    );
    const textRef = useRef<string>(extractText(descendents));
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
        const output = decorations[key] !== undefined ? decorations[key] : [];
        return output;
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
                    const newText = extractText(newValue);
                    if (newText !== textRef.current) {
                        const delay = errorDelay !== undefined
                            ? errorDelay
                            : DEFAULT_DELAY;
                        timerId.current = setTimeout(() => {
                            setDecorations(newValue);
                        }, delay);
                        if (onInputChange) {
                            onInputChange(newText);
                        }
                    }
                    textRef.current = newText;
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

const Paragraph = makeRefComponent<HTMLParagraphElement, TypedRenderElementProps<ParagraphElement>>("Paragraph", ({ children, attributes }, forwardedRef) => {
    const { ref, ...rest } = attributes;
    return (
        <p
            ref={mergeRefs(forwardedRef, ref)}
            {...rest}
        >
            {children}
        </p>
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