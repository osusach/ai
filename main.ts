import { createInterface } from "node:readline";
import { AI } from "./ai";

async function main() {
  const ai = await AI.create({
    llmModel: "llama3",
    embedModel: "mxbai-embed-large",
  });

  await ai.storePDFs(["./files"]);

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
  });

  let input: string | null = "";
  console.log("Escribe 'salir' para terminar el chat.");
  rl.prompt();
  rl.on("line", async (input) => {
    if (input.toLowerCase() === "salir") {
      console.log("Adiós!");
      rl.close();
      return;
    }

    const result = await ai.ask(input);
    console.log("\x1b[36m%s\x1b[0m", result.answer);

    rl.prompt();
  }).on("close", () => {
    process.exit(0);
  });
}

main().catch(console.error);
