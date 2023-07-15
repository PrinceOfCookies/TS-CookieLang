import { State } from "../frontend/ast.ts";
import Env from "./env.ts";
export type ValueType = "null" | "number" | "boolean" | "object" | "nativefunction" | "function";

export interface RunTimeValue {
  type: ValueType;
}

export interface NullValue extends RunTimeValue {
  type: "null";
  value: null;
}

export function MK_NULL(): NullValue {
  return { type: "null", value: null } as NullValue;
}

export interface BooleanValue extends RunTimeValue {
  type: "boolean";
  value: boolean;
}

export function MK_BOOL(b = true): BooleanValue {
  return { type: "boolean", value: b } as BooleanValue;
}

export interface NumberValue extends RunTimeValue {
  type: "number";
  value: number;
}

export function MK_NUM(n = 0): NumberValue {
  return { type: "number", value: n } as NumberValue;
}

export interface ObjectValue extends RunTimeValue {
  type: "object";
  properties: Map<string, RunTimeValue>;
}

export type FunctionCall = (args: RunTimeValue[], env: Env) => RunTimeValue;
export interface NativeFuncValue extends RunTimeValue {
  type: "nativefunction";
  call: FunctionCall;
}

export function MK_NATIVE_FUNC(call: FunctionCall): NativeFuncValue {
  return { type: "nativefunction", call } as NativeFuncValue;
}

export interface FunctionValue extends RunTimeValue {
  type: "function";
  name: string;
  params: string[];
  declEnv: Env;
  body: State[];
  async: boolean;
  global: boolean;
}