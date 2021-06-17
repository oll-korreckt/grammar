import { Token, TokenType } from "./_types";

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
        if (EnglishScanner._isWhitespaceChar(currentChar)) {
            return this._finishWhiteSpace();
        } else if (EnglishScanner._isStartWordChar(currentChar)) {
            return this._finishWord();
        } else {
            throw `Character ${currentChar.value} with code ${currentChar.code} is not recognized`;
        }
    }

    private _finishWhiteSpace(): Token {
        while (this._match(EnglishScanner._isWhitespaceChar)) { }
        return this._createToken("whitespace");
    }

    private _finishWord(): Token {
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

    private _finishWord_hyphenEnDash(current: char): Token {
        const nextChar = this._peekNext();
        if (nextChar.code === current.code) {
            return this._createToken("word");
        } else if (EnglishScanner._isStartWordChar(nextChar)) {
            this._advance();
            return this._finishWord();
        }
        throw "";
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
}
