import {
  AssignmentExpr,
  BinaryExpr,
  CallExpr,
  Identifier,
  ObjectLit,
} from "../../frontend/ast.ts";
import Env from "../env.ts";
import { C_eval } from "../interp.ts";
import {
FunctionValue,
  MK_NULL,
  NativeFuncValue,
  NumberValue,
  ObjectValue,
  RunTimeValue,
} from "../values.ts";

function C_evalNumBinExpr(
  leftside: NumberValue,
  rightside: NumberValue,
  operator: string
): NumberValue {
  let result: number;

  switch (operator) {
    case "+":
      result = leftside.value + rightside.value;
      break;

    case "-":
      result = leftside.value - rightside.value;
      break;
    case "*":
      result = leftside.value * rightside.value;
      break;

    case "/":
      // TODO: Handle divide by zero
      result = leftside.value / rightside.value;
      break;

    default:
      result = leftside.value % rightside.value;
      break;
  }

  return { value: result, type: "number" };
}

export function C_evalBinaryExpr(BinOp: BinaryExpr, env: Env): RunTimeValue {
  const leftside = C_eval(BinOp.left, env);
  const rightside = C_eval(BinOp.right, env);

  if (leftside.type == "number" && rightside.type == "number") {
    return C_evalNumBinExpr(
      leftside as NumberValue,
      rightside as NumberValue,
      BinOp.operator
    );
  }

  // Left or Right (or both) are null
  return MK_NULL();
}

export function C_evalIdentifier(id: Identifier, env: Env): RunTimeValue {
  const val = env.getVar(id.name);
  return val;
}

export function C_evalAssignmentExpr(
  node: AssignmentExpr,
  env: Env
): RunTimeValue {
  if (node.assigne.kind != "Identifier")
    throw `Cannot assign to non-identifier: ${node.assigne}`;

  const varName = (node.assigne as Identifier).name;

  return env.assignVar(varName, C_eval(node.value, env));
}

export function C_evalObjExpr(obj: ObjectLit, env: Env): RunTimeValue {
  const object = { type: "object", properties: new Map() } as ObjectValue;

  for (const { key, value } of obj.properties) {
    // Handles valid key: pair
    const runtimeVal =
      value == undefined ? env.getVar(key) : C_eval(value, env);

    object.properties.set(key, runtimeVal);

  }

  return object;
}

export function C_evalCallExpr(Expr: CallExpr, env: Env): RunTimeValue {
  const args = Expr.args.map((arg) => C_eval(arg, env));

  if (Expr.callee.kind != "Identifier")
    throw `Cannot call non-identifier: ${Expr.callee}`;

  const funcName = C_eval(Expr.callee, env);

  if (funcName.type == "nativefunction") {
    const result = (funcName as NativeFuncValue).call(args, env);
    return result;
  } 
  
  if (funcName.type == "function") {
    const func = funcName as FunctionValue;
    const scope = new Env(func.declEnv);

    // Create the variables for the params list
    for (let i = 0; i < func.params.length; i++) {
      const FuncName = func.params[i];
      const FuncVal = func.params[i] ? args[i] : MK_NULL();
      scope.declareVar(FuncName, FuncVal, false);
    }

    let result: RunTimeValue = MK_NULL();

    for (const statement of func.body) {
      result = C_eval(statement, scope);
    }

    return result;
  }

  throw `Cannot call non-function: ${JSON.stringify(funcName)}`;
}
