import {
  State,
  Program,
  Expr,
  BinaryExpr,
  Identifier,
  NumberLit,
  VarDecl,
  FuncDecl,
  AssignmentExpr,
  Property,
  ObjectLit,
  CallExpr,
  MemberExpr,
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
      case TokenType.Func:
        return this.parseFuncDecl();

      default:
        return this.parseExpr();
    }
  }

  // ( CONST | LET ) IDENTIFIER ( EQUALS EXPR )?
  parseVarDecl(): State {
    const constant = this.adv().type == TokenType.const;
    const id = this.expect(
      TokenType.Identifier,
      `Expected identifier following variable declaration. Found: ${
        this.at().value
      }`
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
      `Expected equals sign in variable declaration. Found: ${this.at().value}`
    );

    const decl = {
      kind: "VarDecl",
      constant: constant,
      id,
      value: this.parseExpr(),
    } as VarDecl;

    return decl;
  }

  parseFuncDecl(): State {
    // Check for async keyword before func keyword
    let global = false;
    // deno-lint-ignore prefer-const
    let async = false;

    //if (this.at().type == TokenType.Async) {
    //  async = true;
    //  this.adv(); // Adv past async
    //}

    this.adv(); // Adv past Func

    const name = this.expect(
      TokenType.Identifier,
      `Expected identifier following function declaration. Found: ${
        (this.at().value)
      } instead.`
    ).value;

    // Check if there is a captial G at the end of the name
    if (name[name.length - 1] == "G")
      global = true;
        
    // Reads comma seperated arguments between parenthesis
    const args = this.parseArgs();

    // Make sure they are all strings
    const params: string[] = [];

    for (const arg of args) {
      if (arg.kind != "Identifier") {
        console.log(arg);
        throw `Unexpected parameter types found. Expected type identifier. Found: ${arg.kind} instead.`;
      }

      params.push((arg as Identifier).name);
    }

    this.expect(TokenType.OpenBrace, `Expected opening brace. Found: ${this.at().value} instead.`);

    const body: State[] = [];
    
    while (this.notEOF() && this.at().type != TokenType.CloseBrace) { 
      body.push(this.parseState());
    }

    this.expect(TokenType.CloseBrace, `Expected closing brace. Found: ${this.at().value} instead.`);

    const Func = {
      kind: "FuncDecl",
      name,
      params,
      body,
      async,
      global,
    } as FuncDecl;

    return Func
  }

  private parseExpr(): Expr {
    return this.parseAssignExpr();
  }

  // ****** Order of Precedence ******
  // 1. AssignExpr
  // 2. AddExpr
  // 3. MultiExpr
  // 4. CallExpr
  // 5. MemberExpr
  // 6. PrimaryExpr

  private parseAssignExpr(): Expr {
    const left = this.parseObjExpr();

    if (this.at().type == TokenType.Equals) {
      this.adv(); // adv past equals
      const value = this.parseAssignExpr();
      return {
        kind: "AssignmentExpr",
        assigne: left,
        value,
      } as AssignmentExpr;
    }

    return left;
  }

  private parseObjExpr(): Expr {
    // { Prop[] }

    if (this.at().type != TokenType.OpenBrace) {
      return this.parseAddExpr();
    }

    this.adv(); // adv past open brace
    const properties = new Array<Property>();

    while (this.notEOF() && this.at().type != TokenType.CloseBrace) {
      //  { key : value, key2: val }
      // { key }

      const key = this.expect(
        TokenType.Identifier,
        `Unexpected token found inside object. Expected identifier. Found: ${
          this.at().value
        }`
      ).value;

      // Allows for { key } and { key, key2 }
      if (this.at().type == TokenType.Comma) {
        this.adv(); // Adv past the command
        properties.push({ kind: "Property", key } as Property);
        continue;
      } // Allows shothand key: { key }
      else if (this.at().type == TokenType.CloseBrace) {
        properties.push({ kind: "Property", key });
        break;
      }

      // Allows for { key: value }
      this.expect(
        TokenType.Colon,
        `Expected colon following key in object. Found: ${this.at().value}`
      );
      const value = this.parseExpr();

      properties.push({ kind: "Property", key, value } as Property);
      if (this.at().type != TokenType.CloseBrace)
        this.expect(
          TokenType.Comma,
          `Expected comma, or closing brace following property in object. Found: ${
            this.at().value
          } `
        );
    }

    this.expect(
      TokenType.CloseBrace,
      `Unexpected token found inside object literal. Expected closing brace. Found ${
        this.at().value
      }`
    ); // adv past close brace
    return { kind: "ObjectLit", properties } as ObjectLit;
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
    let left = this.parseCallMemberExpr();

    while (
      this.at().value == "/" ||
      this.at().value == "*" ||
      this.at().value == "%"
    ) {
      const operator = this.adv().value;
      const right = this.parseCallMemberExpr();
      left = {
        kind: "BinaryExpr",
        left,
        right,
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  // foo.x()()
  private parseCallMemberExpr(): Expr {
    const member = this.parseMemberExpr();

    if (this.at().type == TokenType.OpenParen) {
      return this.parseCallExpr(member);
    }

    return member;
  }

  private parseCallExpr(callee: Expr): Expr {
    let callExpr: Expr = {
      kind: "CallExpr",
      args: this.parseArgs(),
      callee,
    } as CallExpr;

    if (this.at().type == TokenType.OpenParen) {
      callExpr = this.parseCallExpr(callExpr);
    }

    return callExpr;
  }

  // Args (x + 5, foo()) ~= Params (x = 1, y = 2)
  private parseArgs(): Expr[] {
    // Should never be called, but just in case..
    this.expect(
      TokenType.OpenParen,
      `Expected open parenthesis. Found: ${this.at().value} instead.`
    );

    const args =
      this.at().type == TokenType.CloseParen ? [] : this.parseArgsList();

    this.expect(
      TokenType.CloseParen,
      `Expected closing parenthesis. Found: ${this.at().value} instead.`
    );

    return args;
  }

  private parseArgsList(): Expr[] {
    const args = [this.parseExpr()];

    while (this.at().type == TokenType.Comma && this.adv()) {
      args.push(this.parseExpr());
    }

    return args;
  }

  private parseMemberExpr(): Expr {
    let obj = this.parsePrimaryExpr();

    while (
      this.at().type == TokenType.Dot ||
      this.at().type == TokenType.OpenBracket
    ) {
      const op = this.adv();

      let prop: Expr;
      let computed: boolean;

      // Non-computed property (obj.expr)
      if (op.type == TokenType.Dot) {
        computed = false;

        // Get the Identifier
        prop = this.parsePrimaryExpr();

        if (prop.kind != "Identifier")
          throw `Unexpected token found. Expected identifier. Found: ${prop.kind} instead.`;
      } else {
        // Allows for computed properties (obj[expr])
        computed = true;

        // Get the Expression
        prop = this.parseExpr();

        this.expect(
          TokenType.CloseBracket,
          `Expected closing bracket. Found: ${this.at().value} instead.`
        );
      }

      obj = {
        kind: "MemberExpr",
        obj,
        prop,
        computed,
      } as MemberExpr;
    }

    return obj;
  }

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
          `Unexpected token found inside parenthesised expression. Expected closing parenthesis. Found: ${
            this.at().value
          }`
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
