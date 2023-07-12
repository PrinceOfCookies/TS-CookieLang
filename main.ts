import Parser from "./frontend/parser.ts";
import Env from "./runtime/env.ts";
import { C_eval } from "./runtime/interp.ts";
import { MK_BOOL, MK_NULL } from "./runtime/values.ts";
repl();

function repl() {
  const parser = new Parser();
  const env = new Env();
  console.log("\nRepl v0.0.1");

  // Create default Global Environment
  env.declareVar("true", MK_BOOL(true), true);
  env.declareVar("false", MK_BOOL(false), true);
  env.declareVar("null", MK_NULL(), true);

  while (true) {
    const input = prompt(">> ");

    if (!input || input.includes("exit") || input.includes("quit")) {
      Deno.exit(1);
    }

    const ast = parser.produceAST(input);
    const result = C_eval(ast, env);
    console.log(result);
  }
}
