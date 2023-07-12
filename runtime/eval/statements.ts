import { Program, VarDecl } from "../../frontend/ast.ts";
import Env from "../env.ts";
import { C_eval } from "../interp.ts";
import { MK_NULL, RunTimeValue } from "../values.ts";

export function C_evalProgram(program: Program, env: Env): RunTimeValue {
  let lastEval: RunTimeValue = MK_NULL();
  for (const statement of program.body) {
    lastEval = C_eval(statement, env);
  }
  return lastEval;
}

export function C_evalVarDecl(decl: VarDecl, env: Env): RunTimeValue {
  const value = decl.value ? C_eval(decl.value, env) : MK_NULL();
  
  return env.declareVar(decl.id, value, decl.constant);
}
