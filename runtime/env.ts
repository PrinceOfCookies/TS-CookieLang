import { RunTimeValue } from "./values.ts";

export default class Env {
  private parent?: Env;
  private vars: Map<string, RunTimeValue>;
  private constants: Set<string>;

  constructor(parentEnv?: Env) {
    this.parent = parentEnv;
    this.vars = new Map();
    this.constants = new Set();
  }

  public declareVar(name: string, value: RunTimeValue, constant: boolean): RunTimeValue {
    if (this.vars.has(name)) {
      throw `Variable ${name} already defined`;
    }

    this.vars.set(name, value);

    if (constant) 
      this.constants.add(name);

    return value;
  }

  public assignVar(name: string, value: RunTimeValue): RunTimeValue {
    const env = this.resolve(name);
    if (env.constants.has(name)) {
      // Cannot assign to constant
      throw `Cannot reassign constant ${name}`;
    }
    env.vars.set(name, value);

    return value;
  }

  public getVar(name: string): RunTimeValue {
    const env = this.resolve(name);

    return env.vars.get(name) as RunTimeValue;
  }

  public resolve(name: string): Env {
    if (this.vars.has(name))
        return this;

    if (this.parent == undefined)
        throw `Variable ${name} not defined`;

    return this.parent.resolve(name);
  }


}
