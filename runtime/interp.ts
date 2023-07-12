import { RunTimeValue, NumberValue } from "./values.ts";
import {
  AssignmentExpr,
  BinaryExpr,
  Identifier,
  NumberLit,
  Program,
  State,
  VarDecl,
} from "../frontend/ast.ts";
import Env from "./env.ts";
import {
  C_evalAssignmentExpr,
  C_evalBinaryExpr,
  C_evalIdentifier,
} from "./eval/expressions.ts";
import { C_evalProgram, C_evalVarDecl } from "./eval/statements.ts";

export function C_eval(astNode: State, env: Env): RunTimeValue {
  switch (astNode.kind) {
    case "NumberLit":
      return {
        value: (astNode as NumberLit).value,
        type: "number",
      } as NumberValue;
    case "Identifier":
      return C_evalIdentifier(astNode as Identifier, env);
    case "BinaryExpr":
      return C_evalBinaryExpr(astNode as BinaryExpr, env);
    case "AssignmentExpr":
      return C_evalAssignmentExpr(astNode as AssignmentExpr, env);
    case "Program":
      return C_evalProgram(astNode as Program, env);

    // handle statements
    case "VarDecl":
      return C_evalVarDecl(astNode as VarDecl, env);

    default:
      console.error("Unknown AST Node: ", astNode);
      Deno.exit(1);
  }
}
