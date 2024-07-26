import { TextLoader } from "langchain/document_loaders/fs/text";
import { getXataClient } from "../xata";
import { ChatOllama } from "@langchain/community/chat_models/ollama";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI } from "@langchain/openai";
import fs from "node:fs";
import { XataVectorSearch } from "@langchain/community/vectorstores/xata";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { Document } from "langchain/document";
import dotenv from "dotenv";
dotenv.config();

async function example() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
  });

  const systemTemplate = [
    "Eres un asistente para estudiantes con aspiracion de entrar a la universidad en Chile.",
    "La información del contexto es la siguiente.",
    "---------------------",
    "{context}",
    "---------------------",
    "Dada la información del contexto y sin conocimientos previos, responde a la consulta.",
    "No des tu opinión personal.",
    "Responde de manera concisa.",
    "Asume que las personas que preguntan son Chilenas.",
  ].join("");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
  ]);

  const client = getXataClient();
  const table = "scholarships";
  const embeddings = new OllamaEmbeddings({ model: "mxbai-embed-large" });
  const store = new XataVectorSearch(embeddings, { client, table });
  const path = "./parse_1_result.md";
  const loader = new TextLoader(path);
  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 0,
    separators: ["#"],
  });
  const splits = await splitter.splitDocuments(docs);
  const newSplits = splits.map(({ pageContent, id, metadata }) => {
    return new Document({
      id,
      pageContent,
      metadata: {
        source: metadata.source,
        university: "USACH",
      },
    });
  });
  // const ids = await store.addDocuments(newSplits);
  console.log("--- added");

  await new Promise((r) => setTimeout(r, 1000));

  // const results = await store.similaritySearchWithScore("pascuense", 6, {
  //   university: "USACH",
  // });
  const results = await store.similaritySearch("pascuense", 6, {
    university: "USACH",
  });
  console.log(results);

  // const retriever = store.asRetriever({
  //   k: 3,
  // });
  // console.log("--- set retriever");

  // const questionAnswerChain = await createStuffDocumentsChain({ llm, prompt });
  // console.log("--- set stuff docs chain");
  // const ragChain = await createRetrievalChain({
  //   retriever,
  //   combineDocsChain: questionAnswerChain,
  // });
  // console.log("--- set rag chain");

  // const results = await ragChain.invoke({
  //   input: "Hay alguna beca para estudiar si soy de rapa nui?",
  // });
  // console.log(results.answer, ids);
}

async function documentParser() {
  const xata = getXataClient();
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const path = "./files/scholarships/basico_internas_usach.md";
  const loader = new TextLoader(path);
  const docs = await loader.load();
  const systemTemplate = [
    "Eres una herramienta para limpiar informacion de becas/cupos.",
    "Asocia cada beca/cupo del contexto con su respectiva descripcion, de la siguente forma: '# BECA PROPEDÉUTICO \n Beca total o parcial correspondiente al...'.",
    "La información del contexto es la siguiente.",
    "---------------------",
    "{context}",
    "---------------------",
    "Dada la información del contexto y sin conocimientos previos, ejecuta tu tarea de asociar y limpiar la informacion.",
    "ES MUY IMPORTANTE QUE NO MODIFIQUES LA INFORMACION, ignora toda informacion que no sea un cupo o una beca.",
  ].join("");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
  ]);

  const embed = new OllamaEmbeddings({ model: "mxbai-embed-large" });
  const vectorstore = await MemoryVectorStore.fromDocuments(docs, embed);

  const retriever = vectorstore.asRetriever({
    k: 3,
  });

  const questionAnswerChain = await createStuffDocumentsChain({ llm, prompt });
  const ragChain = await createRetrievalChain({
    retriever,
    combineDocsChain: questionAnswerChain,
  });

  const results = await ragChain.invoke({
    input: "Responde usando el formato Markdown. Solo con la informacion.",
  });

  console.log(llm.model);

  writeMarkdownFile("parse_1_result.md", results.answer);

  // TODO: pipe info -> llamaparse -> embed -> xata

  // TODO: define getScholarshipsMatches -> { internal, govermental }

  // TODO: profit
}

function writeMarkdownFile(filename: string, content: string) {
  fs.writeFile(filename, content, "utf8", (err) => {
    if (err) {
      console.error("Error writing file:", err);
      return;
    }
    console.log("File has been saved.");
  });
}

example().catch(console.error);
