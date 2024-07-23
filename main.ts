import "pdf-parse";
import { AI } from "./ai";

async function main() {
  const ai = await AI.create({
    llmModel: "llama3",
    embedModel: "mxbai-embed-large",
  });

  let result = await ai.ask(
    "La carrera de artes tiene materias de religion en la Universidad Catolica de Temuco?"
  );

  console.log('\x1b[33m%s\x1b[0m', result.answer);

  await ai.storePDFs([
    "./files/uct_artes.pdf",
  ]);

  result = await ai.ask(
    "La carrera de artes tiene materias de religion en la Universidad Catolica de Temuco?"
  );

  console.log('\x1b[36m%s\x1b[0m', result.answer);
}

main().catch(console.error);
