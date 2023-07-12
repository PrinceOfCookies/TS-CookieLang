// deno-lint-ignore-file no-fallthrough
import {
  State,
  Program,
  Expr,
  BinaryExpr,
  Identifier,
  NumberLit,
  VarDecl,
} from "./ast.ts";
import { Tokenize, Token, TokenType } from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];

  private notEOF(): boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at() {
    return this.tokens[0] as Token;
  }

  private adv() {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  // deno-lint-ignore no-explicit-any
  private expect(type: TokenType, err: any) {
    const prev = this.tokens.shift() as Token;
    if (!prev || prev.type != type) {
      console.error("Parsing Error:\n", err, prev, " - Expecting ", type);
      Deno.exit(1);
    }
    return prev;
  }

  public produceAST(src: string): Program {
    this.tokens = Tokenize(src);

    const program: Program = {
      kind: "Program",
      body: [],
    };

    // Parse until end of file
    while (this.notEOF()) {
      program.body.push(this.parseState());
    }

    return program;
  }

  private parseState(): State {
    // Skip to parseExpr
    switch (this.at().type) {
      case TokenType.Let:

      case TokenType.const:
        return this.parseVarDecl();

      default:
        return this.parseExpr();
    }
  }

  // ( CONST | LET ) IDENTIFIER ( EQUALS EXPR )?
  parseVarDecl(): State {
    const constant = this.adv().type == TokenType.const;
    const id = this.expect(
      TokenType.Identifier,
      "Expected identifier following variable declaration."
    ).value;

    if (this.at().type == TokenType.Pipe) {
      this.adv(); // Expects Pipe
      if (constant)
        throw "Constant variable declaration must be initialized with a value.";

      return {
        kind: "VarDecl",
        constant: false,
        id,
      } as VarDecl;
    }

    this.expect(
      TokenType.Equals,
      "Expected equals sign in variable declaration."
    );

    const decl = {
      kind: "VarDecl",
      constant: constant,
      id,
      value: this.parseExpr(),
    } as VarDecl;

    //this.expect(TokenType.Pipe, "Expected Pipe after variable declaration.");
    return decl;
  }

  private parseExpr(): Expr {
    return this.parseAddExpr();
  }

  private parseAddExpr(): Expr {
    let left = this.parseMultiExpr();

    while (this.at().value == "+" || this.at().value == "-") {
      const operator = this.adv().value;
      const right = this.parseMultiExpr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parseMultiExpr(): Expr {
    let left = this.parsePrimaryExpr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.adv().value;
      const right = this.parsePrimaryExpr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // AssignExpr (Assign)
  // MemberExpr (Dot, Index)
  // FuncCall (CallExpr)
  // LogicExpr (And, Or)
  // CompExpr (Eq, Neq, Lt, Gt, Lte, Gte)
  // AddExpr (Add, Sub)
  // MultiExpr (Mul, Div, Mod)
  // UnaryExpr (Not, Neg)
  // PrimaryExpr (NumberLit, Identifier, ParenExpr)

  private parsePrimaryExpr(): Expr {
    const tk = this.at().type;

    switch (tk) {
      case TokenType.Identifier:
        return { kind: "Identifier", name: this.adv().value } as Identifier;

      case TokenType.Number:
        return {
          kind: "NumberLit",
          value: parseFloat(this.adv().value),
        } as NumberLit;

      case TokenType.OpenParen: {
        this.adv(); // Adv past the open paren
        const expr = this.parseExpr();
        this.expect(
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Expected closing parenthesis."
        ); // Adv past the close paren
        return expr;
      }

      default:
        console.log(
          "Unexpected token found during parsing: { value: ",
          this.at().value,
          ", type: ",
          this.at().type,
          " }"
        );
        Deno.exit(1);
    }
  }
}
