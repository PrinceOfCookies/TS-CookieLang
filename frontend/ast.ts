// deno-lint-ignore-file no-empty-interface
export type NodeType =
  // State
  | "Program"
  | "VarDecl"

  // Expr
  | "AssignmentExpr"

  // Lit
  | "Property"
  | "ObjectLit"
  | "Identifier" 
  | "NumberLit"
  | "BinaryExpr";

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
  constant: boolean;
  id: string;
  value?: Expr;
}

// Does return a value
export interface Expr extends State {}

export interface AssignmentExpr extends Expr {
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

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

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}

export interface ObjectLit extends Expr {
  kind: "ObjectLit";
  properties: Property[];
}
