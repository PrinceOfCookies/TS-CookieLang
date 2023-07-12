export type ValueType = "null" | "number" | "boolean";

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
