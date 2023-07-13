// deno-lint-ignore-file no-unused-vars
import Parser from "./frontend/parser.ts";
import Env, { createEnv_G } from "./runtime/env.ts";
import { C_eval } from "./runtime/interp.ts";
run("./test.txt")

async function run(filename: string) {
  const parser = new Parser();
  const env = createEnv_G();

  const input = await Deno.readTextFile(filename);
  const ast = parser.produceAST(input);

  const result = C_eval(ast, env);
  console.log(result);
}

function repl() {
  const parser = new Parser();
  const env = createEnv_G();

  console.log("\nRepl v0.0.1");
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
