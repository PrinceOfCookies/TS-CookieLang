// deno-lint-ignore-file no-empty-interface
export type NodeType =
  // State
  | "Program"
  | "VarDecl"
  | "FuncDecl"

  // Expr
  | "AssignmentExpr"
  | "MemberExpr"
  | "CallExpr"

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

export interface FuncDecl extends State {
  kind: "FuncDecl";
  name: string;
  params: string[]
  body: State[];
  async: boolean;
  global: boolean;
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

//* These are the same *\\
// foo.bar()
// foo[bar]()
export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  callee: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  obj: Expr;
  prop: Expr;
  computed: boolean;
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
