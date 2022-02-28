import { marked } from "marked";
import { MarkdownCommentHTMLInjection, MarkdownCommentId, MarkdownCommentSnippet, MarkdownHeadingDepth, MarkdownHTML, MarkdownTableCell, MarkdownToken } from "./_types";
import Tokens = marked.Tokens;

type ListItemTextToken = Omit<Tokens.Text, "tokens"> & Required<Pick<Tokens.Text, "tokens">>;

function _isTag(value: marked.Token): value is Tokens.Tag {
    switch (value.type) {
        case "text":
        case "html":
            return "inLink" in value && "inRawBlock" in value;
        default:
            return false;
    }
}

function _toMarkdownHeadingDepth(value: number): MarkdownHeadingDepth {
    if (value < 1 || value > 6) {
        throw `value '${value}' is not a valid heading depth`;
    }
    return value as MarkdownHeadingDepth;
}

function _toMarkdownToken(token: marked.Token): MarkdownToken {
    if (_isTag(token)) {
        throw "cannot use tag tokens";
    }
    switch (token.type) {
        // tokens that are just aliases
        case "br":
        case "code":
        case "codespan":
        case "def":
        case "escape":
        case "hr":
        case "space":
            return token;
        // tokens with a 'tokens' property
        case "blockquote":
        case "del":
        case "em":
        case "paragraph":
        case "strong":
            return {
                ...token,
                tokens: _toMarkdownTokens(token.tokens)
            };
        // special tokens
        case "heading":
            return {
                ...token,
                depth: _toMarkdownHeadingDepth(token.depth),
                tokens: _toMarkdownTokens(token.tokens)
            };
        case "table":
            const columnCnt = token.header.length;
            if (token.align.length !== columnCnt) {
                throw "length of align property of 'table' token should be equal to header length";
            }
            return {
                ...token,
                header: _convertTableCellTokens(token.header, columnCnt),
                rows: token.rows.map((row) => _convertTableCellTokens(row, columnCnt))
            };
        case "html":
            return _toHTMLToken(token);
        case "list":
            return {
                ...token,
                items: token.items.map((item) => {
                    return {
                        ...item,
                        tokens: _convertListItemTokens(item.tokens)
                    };
                })
            };
        case "list_item": {
            throw "'list_item' should only appear in the 'items' property of a 'list' token";
        }
        case "image":
            if (token.href === "") {
                throw "'image' tokens must contain a non-empty 'href' property";
            }
            if (token.text === "") {
                throw "'image' tokens must contain a non-empty 'text' property";
            }
            return token;
        case "link":
            if (token.href === "") {
                throw "'link' tokens must contain a non-empty 'href' property";
            }
            if (token.text === "") {
                throw "'link' tokens must contain a non-empty 'text' property";
            }
            return {
                ...token,
                tokens: _toMarkdownTokens(token.tokens)
            };
        case "text":
            if (token.text.includes("\n")) {
                throw "token contains invalid newline character";
            }
            if (token.tokens !== undefined) {
                throw "'text' tokens should not contain children";
            }
            return token;
    }
}

function _extractCommentText(comment: string): string {
    const trimmedComment = comment.trim();
    const startIndex = "<!--".length;
    const endIndex = trimmedComment.length - "-->".length - 1;
    return trimmedComment.slice(startIndex, endIndex).trim();
}

function _toHTMLToken(token: Tokens.HTML): MarkdownHTML | MarkdownCommentId | MarkdownCommentSnippet | MarkdownCommentHTMLInjection {
    const commentText = _extractCommentText(token.text);
    if (commentText.startsWith("#")) {
        return {
            ...token,
            type: "comment.id",
            id: commentText.slice(1)
        };
    } else if (commentText.startsWith("!")) {
        return {
            ...token,
            type: "comment.snippet",
            name: commentText.slice(1)
        };
    } else if (commentText.startsWith("+")) {
        return {
            ...token,
            type: "comment.htmlInjection",
            id: commentText.slice(1)
        };
    } else {
        return token;
    }
}

function _toMarkdownTokens(tokens: marked.Token[]): MarkdownToken[] {
    return tokens.map((token) => _toMarkdownToken(token));
}

function _convertTableCellTokens(tokens: Tokens.TableCell[], expectedLength: number): MarkdownTableCell[] {
    if (tokens.length !== expectedLength) {
        throw `Table expected to have ${expectedLength} column(s) but contains a set of cells with ${tokens.length} column(s)`;
    }
    return tokens.map((token) => {
        return {
            ...token,
            tokens: _toMarkdownTokens(token.tokens)
        };
    });
}

function _convertListItemTokens(tokens: marked.Token[]): MarkdownToken[] {
    switch (tokens.length) {
        case 0:
            throw "a 'list_item' should contain at least 1 token";
        case 1: {
            const [textToken] = tokens;
            if (!_isListItemTextToken(textToken)) {
                throw "a 'list_item' token containing only 1 token should contain a 'text' token with populated 'tokens'";
            }
            return _toMarkdownTokens(textToken.tokens);
        }
        case 2: {
            const [textToken, listToken] = tokens;
            if (!_isListItemTextToken(textToken)) {
                throw "the first token of a 'list_item' token containing 2 tokens should be a 'text' token with populated 'tokens'";
            }
            if (listToken.type !== "list") {
                throw "the second token of a 'list_item' token containing 2 tokens should be a 'list' token";
            }
            const textTokenSubTokensOutput = _toMarkdownTokens(textToken.tokens);
            const listTokenOutput = _toMarkdownToken(listToken);
            return [
                ...textTokenSubTokensOutput,
                listTokenOutput
            ];
        }
        default:
            throw "a 'list_item' token should not contain more than 2 tokens";
    }
}

function _isListItemTextToken(token: marked.Token): token is ListItemTextToken {
    if (_isTag(token)) {
        return false;
    }
    return token.type === "text" && token.tokens !== undefined;

}

function scan(content: string): MarkdownToken[] {
    const lexerTokens = marked.lexer(content);
    const tokens = _toMarkdownTokens(lexerTokens);
    return tokens;
}

export const MarkdownScanner = {
    scan: scan
};