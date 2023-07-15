import { FuncDecl, Program, VarDecl } from "../../frontend/ast.ts";
import Env from "../env.ts";
import { C_eval } from "../interp.ts";
import { FunctionValue, MK_NULL, RunTimeValue } from "../values.ts";

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

export function C_evalFuncDecl(decl: FuncDecl, env: Env): RunTimeValue {
  const func = {
    type: "function",
    name: decl.name,
    params: decl.params,
    declEnv: env,
    body: decl.body,
    async: decl.async,
    global: decl.global,
  } as FunctionValue;

  return env.declareVar(decl.name, func, true);
}
