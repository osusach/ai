import { LlamaParseReader } from "llamaindex";
import { readdir, writeFile } from "fs/promises";
import "dotenv/config";

async function parse(reader: LlamaParseReader, paths: string[]) {
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

async function parseImages(reader: LlamaParseReader, folderPath: string, title: string) {
  const files = await readdir(folderPath);
  files.sort(
    (a, b) =>
      parseInt(a.split("_")[1].split(".")[0]) -
      parseInt(b.split("_")[1].split(".")[0])
  );
  console.log(files);

  let text = "# ".concat(title, "\n");
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const data = await reader.loadData(folderPath.concat("/", file));

    console.log("Archivo parseado");
    for (let index = 0; index < data.length; index++) {
      const document = data[index];
      text = text.concat(document["text"]);
    }
  }
  console.log("Escribiendo archivo/s");
  await writeFile(`${folderPath}.md`, text);
}

async function main() {
  const infoPass = new LlamaParseReader({
    resultType: "markdown",
    language: "es",
    useVendorMultimodalModel: true,
    vendorMultimodalApiKey:
      process.env.OPENAI_KEY,
    vendorMultimodalModelName: "openai-gpt-4o-mini",
    parsingInstruction: "",
  });

  const coursesPass = new LlamaParseReader({
    resultType: "markdown",
    language: "es",
    useVendorMultimodalModel: true,
    vendorMultimodalApiKey:
    process.env.OPENAI_KEY,
    vendorMultimodalModelName: "openai-gpt-4o-mini",
    parsingInstruction:
      "Give me the list of courses by semester. SKIP anything that is not number of semester and name of the course, NOTHING ELSE SHOULD BE PARSED.",
  });

  const paths = [
    "./filesToParse/uct_artes.pdf",
    "./filesToParse/UNIVERSIDAD DE SANTIAGO-Ing-Civil-Informática-2022.pdf",
  ];
  // parse(infoPass);
  // parse(coursesPass, [
  //   "./filesToParse/column_1.png",
  //   "./filesToParse/column_2.png",
  // ]);
  // parseImages(coursesPass, "./filesToParse/images/adminempr_10.png_crop", "ING. EN ADMINISTRACIÓN DE EMPRESAS UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/arqui_11.png_crop", "ARQUITECTURA UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/derecho_10.png_crop", "DERECHO UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/economia_10.png_crop", "ING. COMERCIAL EN ECONOMÍA UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/enfermeria_10.png_crop", "ENFERMERÍA UNIVERSIDAD DE SANTIAGO ");
  // parseImages(coursesPass, "./filesToParse/images/medicina_14.png_crop", "MEDICINA UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/periodismo_10.png_crop", "PERIODISMO UNIVERSIDAD DE SANTIAGO");
  // parseImages(coursesPass, "./filesToParse/images/psicologia_10.png_crop", "PSICOLOGÍA UNIVERSIDAD DE SANTIAGO");
  parseImages(coursesPass, "./filesToParse/images/info_11.png_crop", "ING. CIVIL INFORMÁTICA UNIVERSIDAD DE SANTIAGO");
}

main().catch(console.error);
