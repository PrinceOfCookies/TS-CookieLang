// deno-lint-ignore-file no-empty-interface
export type NodeType =
  | "Program" // 1
  | "VarDecl" // 2
  | "NumberLit" // 3
  | "Identifier" // 4
  | "BinaryExpr"; // 5

// Doesn't return a value
export interface State {
  kind: NodeType;
}

export interface Program extends State {
  kind: "Program";
  body: State[];
}

export interface VarDecl extends State {
  kind: "VarDecl";
  constant: boolean,
  id: string,
  value?: Expr;
}

// Does return a value
export interface Expr extends State {}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  name: string;
}

export interface NumberLit extends Expr {
  kind: "NumberLit";
  value: number;
}
