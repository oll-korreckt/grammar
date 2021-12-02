import { Token, TokenType } from "./_types";

export function scan(target: string): ScanResult {
    return new EnglishScanner().scan(target);
}

export type ScanResult = {
    type: "tokens";
    data: Token[];
} | {
    type: "errors";
    data: ScannerError[];
}

enum ResultType {
    token = 1,
    error = 2
}

export interface ScannerError {
    start: number;
    end: number;
    message: string;
}

type TokenResult = [ResultType.token, Token];
type ErrorResult = [ResultType.error, ScannerError];
type Result = TokenResult | ErrorResult;

interface char {
    value: string;
    code: number;
}

const endChar: char = {
    value: "\0",
    code: "\0".charCodeAt(0)
};

const hyphen = "-";
const enDash = "–";
const emDash = "—";

const startPunct = [
    "(",
    "[",
    "'",
    "\"",
    "#",
    "$",
    "&",
    "+"
];
const contPunct = [
    ".",
    "!",
    "?",
    ",",
    ";",
    ":",
    ")",
    "]",
    "/",
    "%"
];

class EnglishScanner {
    private static _createChar(value: string): char {
        return {
            value: value,
            code: value.charCodeAt(0)
        };
    }

    private static _isWhitespaceChar({ value }: char): boolean {
        switch (value) {
            case " ":
            case hyphen:
            case enDash:
            case emDash:
                return true;
            default:
                return false;
        }
    }

    private static _isStartWordChar(value: char): boolean {
        return EnglishScanner._isLetter(value)
            || EnglishScanner._isNumber(value)
            || EnglishScanner._isStartingPunctuation(value);
    }

    private static _isErrorChar(value: char): boolean {
        return !(EnglishScanner._isWhitespaceChar(value)
            || EnglishScanner._isStartWordChar(value));
    }

    private static _isStartingPunctuation({ value }: char): boolean {
        return startPunct.includes(value);
    }

    private static _isContWordChar(value: char): boolean {
        const output = EnglishScanner._isLetter(value)
            || EnglishScanner._isNumber(value)
            || EnglishScanner._isContPunct(value);
        return output;
    }

    private static _isLetter(value: char): boolean {
        const a = "a".charCodeAt(0);
        const z = "z".charCodeAt(0);
        const A = "A".charCodeAt(0);
        const Z = "Z".charCodeAt(0);
        const output = (value.code >= a && value.code <= z)
            || (value.code >= A && value.code <= Z);
        return output;
    }

    private static _isNumber(value: char): boolean {
        const zero = "0".charCodeAt(0);
        const nine = "9".charCodeAt(0);
        const output = value.code >= zero && value.code <= nine;
        return output;
    }

    private static _isContPunct(value: char): boolean {
        const output = EnglishScanner._isStartingPunctuation(value)
            || contPunct.includes(value.value);
        return output;
    }

    private _target = "";
    private _start = 0;
    private _current = 0;
    private _tokens: Token[] = [];
    private _errors: ScannerError[] = [];

    public scan(target: string): ScanResult {
        this._target = target;
        while (!this._isAtEnd()) {
            this._start = this._current;
            const result = this._scanNextToken();
            if (result[0] === ResultType.error) {
                this._errors.push(result[1]);
            } else {
                this._tokens.push(result[1]);
            }
        }
        this._tokens.push({
            lexeme: "",
            tokenType: "end"
        });
        return this._errors.length === 0
            ? { type: "tokens", data: this._tokens }
            : { type: "errors", data: this._errors };
    }

    private _scanNextToken(): Result {
        const currentChar = this._advance();
        if (EnglishScanner._isWhitespaceChar(currentChar)) {
            return this._finishWhiteSpace();
        } else if (EnglishScanner._isStartWordChar(currentChar)) {
            return this._finishWord();
        } else {
            return this._finishError();
        }
    }

    private _finishWhiteSpace(): TokenResult {
        while (this._match(EnglishScanner._isWhitespaceChar)) { }
        return this._createToken("whitespace");
    }

    private _finishWord(): Result {
        while (this._match(EnglishScanner._isContWordChar)) {
            // advance
        }
        const peekChar = this._peek();
        switch (peekChar.value) {
            case hyphen:
            case enDash:
                return this._finishWord_hyphenEnDash(peekChar);
        }
        return this._createToken("word");
    }

    private _finishWord_hyphenEnDash(current: char): Result {
        const nextChar = this._peekNext();
        if (nextChar.code === current.code) {
            return this._createToken("word");
        } else if (EnglishScanner._isStartWordChar(nextChar)) {
            this._advance();
            return this._finishWord();
        }
        this._advance();
        this._advance();
        return this._finishError();
    }

    private _createToken(tokenType: TokenType): TokenResult {
        const token: Token = {
            lexeme: this._getCurrentSubstring(),
            tokenType: tokenType
        };
        return [ResultType.token, token];
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

    private _peekNext(): char {
        const currentPlus1 = this._current + 1;
        if (currentPlus1 >= this._target.length) {
            return endChar;
        }
        return EnglishScanner._createChar(this._target[currentPlus1]);
    }

    private _advance(): char {
        this._current++;
        return EnglishScanner._createChar(this._target[this._current - 1]);
    }

    private _isAtEnd(): boolean {
        return this._current >= this._target.length;
    }

    private _finishError(): ErrorResult {
        while (this._match(EnglishScanner._isErrorChar)) { }
        const err: ScannerError = {
            start: this._start,
            end: this._current,
            message: `Invalid character(s) '${this._getCurrentSubstring()}'`
        };
        return [ResultType.error, err];
    }
}
