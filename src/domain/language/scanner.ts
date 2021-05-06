import { Token, TokenType } from "./types";

export function scan(target: string): Token[] {
    return new EnglishScanner().scan(target);
}

interface char {
    value: string;
    code: number;
}

const endChar: char = {
    value: "\0",
    code: "\0".charCodeAt(0)
};

class EnglishScanner {
    private static _createChar(value: string): char {
        return {
            value: value,
            code: value.charCodeAt(0)
        };
    }

    private static _isWordChar(value: char): boolean {
        return (
            (value.code >= "a".charCodeAt(0) &&
                value.code <= "z".charCodeAt(0)) ||
            (value.code >= "A".charCodeAt(0) && value.code <= "Z".charCodeAt(0))
        );
    }

    private _target = "";
    private _start = 0;
    private _current = 0;
    private _tokens: Token[] = [];

    public scan(target: string): Token[] {
        this._target = target;
        while (!this._isAtEnd()) {
            this._start = this._current;
            const nextToken = this._scanNextToken();
            this._tokens.push(nextToken);
        }
        this._tokens.push({
            lexeme: "",
            tokenType: "end"
        });
        return this._tokens;
    }

    private _scanNextToken(): Token {
        const currentChar = this._advance();
        switch (currentChar.value) {
            case " ":
                return this._finishWhiteSpace();
            default:
                if (EnglishScanner._isWordChar(currentChar)) {
                    return this._finishWord();
                } else {
                    throw `Character ${currentChar.value} with code ${currentChar.code} is not recognized`;
                }
        }
    }

    private _finishWhiteSpace(): Token {
        while (this._match((x) => x.value === " ")) {}
        return this._createToken("whitespace");
    }

    private _finishWord(): Token {
        while (this._match(EnglishScanner._isWordChar)) {}
        return this._createToken("word");
    }

    private _createToken(tokenType: TokenType): Token {
        return {
            lexeme: this._getCurrentSubstring(),
            tokenType: tokenType
        };
    }

    private _getCurrentSubstring(): string {
        const length = this._current - this._start;
        return this._target.substr(this._start, length);
    }

    private _match(matchFn: (c: char) => boolean): boolean {
        if (this._isAtEnd()) {
            return false;
        }
        const peekChar = this._peek();
        if (!matchFn(peekChar)) {
            return false;
        }
        this._current++;
        return true;
    }

    private _peek(): char {
        if (this._isAtEnd()) {
            return endChar;
        }
        return EnglishScanner._createChar(this._target[this._current]);
    }

    private _advance(): char {
        this._current++;
        return EnglishScanner._createChar(this._target[this._current - 1]);
    }

    private _isAtEnd(): boolean {
        return this._current >= this._target.length;
    }
}
