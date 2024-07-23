import { LlamaParseReader } from "llamaindex";
import { writeFile } from "fs/promises";
import "dotenv/config";
import { log } from "console";

async function main() {
  const reader = new LlamaParseReader({
    resultType: "markdown",
    language: "es",
    // parsingInstruction = "Instrucción para parsear en inglés, usa LLM por debajo",
  });

  const paths = [
    "./filesToParse/uct_artes.pdf",
    "./filesToParse/Usach-Ing-Civil-Informática-2022.pdf",
  ];

  for (let i = 0; i < paths.length; i++) {
    const path = paths[i];
    const data = await reader.loadData(path);
    console.log("Escribiendo archivo/s");
    
    for (let index = 0; index < data.length; index++) {
      const document = data[index];
      await writeFile(`${path}-${index}.md`, document["text"]);
    }
  }
}

main().catch(console.error);
