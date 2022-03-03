import { AST, NodeType } from "./RegexAST";

enum ParsePrecedence {
    NONE,
    OR,
    QUESTION,
    STAR,
    PLUS,
    SELECT,
    GROUP,
    PRIMARY,
}

export class ParseError extends Error {
    constructor(msg: string) {
        super(msg);
    }
}

type PrefixParser = (self: Parser) => AST;
type InfixParser = (self: Parser, left: AST) => AST;
type ParseRule = { prefix: PrefixParser | null; infix: InfixParser | null; precedence: ParsePrecedence };
type NextPredicate = (next: string) => boolean;

export class Parser {
    position: number = 0;
    input: string = "";
    rules: Map<NextPredicate, ParseRule> = new Map();
    alnum: RegExp = /[a-zA-Z0-9]/;

    private addRule(
        rule: NextPredicate,
        prefix: PrefixParser | null,
        infix: InfixParser | null,
        precedence: ParsePrecedence
    ) {
        this.rules.set(rule, { prefix: prefix, infix: infix, precedence: precedence });
    }

    public constructor(input: string) {
        this.input = input;
        this.addRule(
            (n) => this.alnum.test(n),
            (self) => self.basic(),
            (self, left) => new AST("", NodeType.Concatenation, [left, self.basic()]),
            ParsePrecedence.PRIMARY
        );
        this.addRule(
            (n) => n == "[",
            (self) => self.select(),
            (self, left) => new AST("", NodeType.Concatenation, [left, self.select()]),
            ParsePrecedence.SELECT
        );
        this.addRule(
            (n) => n == "(",
            (self) => self.group(),
            (self, left) => new AST("", NodeType.Concatenation, [left, self.group()]),
            ParsePrecedence.GROUP
        );
        this.addRule(
            (n) => n == "|",
            null,
            (self, left) => self.or(left),
            ParsePrecedence.OR
        );
        this.addRule(
            (n) => n == "*",
            null,
            (self, left) => self.star(left),
            ParsePrecedence.STAR
        );
        this.addRule(
            (n) => n == "+",
            null,
            (self, left) => self.plus(left),
            ParsePrecedence.PLUS
        );
        this.addRule(
            (n) => n == "?",
            null,
            (self, left) => self.question(left),
            ParsePrecedence.QUESTION
        );
        this.addRule((n) => /[\)\]\|\+\*\?]/.test(n), null, null, ParsePrecedence.NONE);
    }

    private consumeAlnum(): string {
        if (this.isAtEnd()) {
            console.error("Reached EOF");
            throw new ParseError("Reached EOF");
        } else if (!this.alnum.test(this.peekMaybeThrow())) {
            console.error("Expected alpha-numeric character in input");
            throw new ParseError("Expected alpha-numeric character in input");
        } else {
            return this.advance()!;
        }
    }

    private consume(lex: string, msg: string): void {
        if (this.isAtEnd()) {
            console.error("Reached EOF");
            throw new ParseError("Reached EOF");
        } else if (this.peekMaybeThrow() != lex) {
            console.error(msg);
            throw new ParseError(msg);
        } else {
            this.advance();
        }
    }

    private isAtEnd(): boolean {
        return this.position >= this.input.length;
    }

    private advance(): string | null {
        if (this.isAtEnd()) {
            return null;
        } else {
            this.position++;
            console.log(`advance: ${this.input.at(this.position - 1)}`);
            return this.input.at(this.position - 1) ?? null;
        }
    }

    private advanceMaybeThrow(): string {
        const advance = this.advance();
        if (advance == null) {
            throw new ParseError("`advance()` returned null");
        } else {
            return advance;
        }
    }

    private peek(): string | null {
        return this.input.at(this.position) ?? null;
    }

    private peekMaybeThrow(): string {
        const peek = this.peek();
        if (peek == null) {
            throw new ParseError("`peek()` returned null");
        } else {
            return peek;
        }
    }

    private match(next: string): boolean {
        if (!this.isAtEnd() && next.length == 1 && this.peekMaybeThrow() == next) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    private matchAlnum(): boolean {
        if (!this.isAtEnd() && this.alnum.test(this.peek()!)) {
            this.advance();
            return true;
        } else {
            return false;
        }
    }

    private getRule(lex: string): ParseRule | null {
        for (const [pred, rule] of this.rules) {
            if (pred(lex)) {
                return rule;
            }
        }
        return null;
    }

    private getRuleMaybeThrow(lex: string): ParseRule {
        const rule = this.getRule(lex);
        if (rule == null) {
            throw new ParseError(`No rule for '${lex}'`);
        } else {
            return rule;
        }
    }

    private basic(): AST {
        if (this.position == 0) {
            throw new ParseError("Trying to get character before start of input");
        } else {
            let char = this.input.at(this.position - 1);
            if (char != null) {
                return new AST(char, NodeType.Basic, []);
            } else {
                throw new ParseError("Received `null` from input instead of char");
            }
        }
    }

    private select(): AST {
        let contents: AST[] = [];
        while (!this.isAtEnd() && this.peekMaybeThrow() != "]") {
            this.consumeAlnum();
            contents.push(this.basic());
        }

        this.consume("]", "Expected `]` at end of select");

        return new AST("[", NodeType.Select, contents);
    }

    private group(): AST {
        let contents: AST[] = [];
        while (!this.isAtEnd() && this.peekMaybeThrow() != ")") {
            contents.push(this.regex(ParsePrecedence.OR));
        }

        this.consume(")", "Expected `)` at end of group");

        return new AST("(", NodeType.Group, contents);
    }

    private or(left: AST): AST {
        const right = this.regex(ParsePrecedence.OR);

        return new AST("|", NodeType.Or, [left, right]);
    }

    private star(left: AST): AST {
        return new AST("*", NodeType.RepeatMaybe, [left]);
    }

    private plus(left: AST): AST {
        return new AST("+", NodeType.Repeat, [left]);
    }

    private question(left: AST): AST {
        return new AST("?", NodeType.Question, [left]);
    }

    private regex(precedence: ParsePrecedence): AST {
        const next = this.advanceMaybeThrow();
        const rule = this.getRuleMaybeThrow(next);

        if (rule.prefix == null) {
            throw new ParseError(`'${next}' cannot occur at start of regex`);
        }

        let left = rule.prefix(this);

        while (!this.isAtEnd() && precedence <= this.getRuleMaybeThrow(this.peekMaybeThrow()).precedence) {
            const next_infix = this.advanceMaybeThrow();
            const infix = this.getRuleMaybeThrow(next_infix).infix;

            if (infix == null) {
                throw new ParseError(`'${next_infix}' cannot occur as infix or postfix`);
            }

            left = infix(this, left);
        }

        return left;
    }

    private collapseConcatenations(ast: AST) {
        let new_children: AST[] = [];
        for (const child of ast.children) {
            this.collapseConcatenations(child);
            if (child.type == NodeType.Concatenation) {
                for (const child2 of child.children) {
                    if (child2.type != NodeType.Concatenation) {
                        new_children.push(child2);
                    }
                }
            } else {
                new_children.push(child);
            }
        }
        ast.children = new_children;
    }

    public parse(): AST {
        let root = new AST("<root>", NodeType.Root, []);
        while (!this.isAtEnd()) {
            root.addChild(this.regex(ParsePrecedence.OR));
        }

        this.collapseConcatenations(root);

        console.log(root);
        return root;
    }
}
