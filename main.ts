import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { ChatOpenAI, OpenAI } from "@langchain/openai";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { pdfPipe } from "./src/pipe";

async function main() {
  const llm = new ChatOpenAI({
    model: "gpt-4o-mini",
    apiKey: process.env.OPENAI_API_KEY,
  });
  const embed = new OllamaEmbeddings({ model: "mxbai-embed-large" });
  const chunks = await pdfPipe({ path: "./files/uct_artes.pdf" });
  const vectorstore = await MemoryVectorStore.fromDocuments(chunks, embed);

  const retriever = vectorstore.asRetriever({
    k: 3,
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
    "Asume que los cursos/ramos son obligatorios de tomar si se presenta una malla escolar.",
  ].join("");

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", systemTemplate],
    ["human", "{input}"],
  ]);

  const questionAnswerChain = await createStuffDocumentsChain({ llm, prompt });
  const ragChain = await createRetrievalChain({
    retriever,
    combineDocsChain: questionAnswerChain,
  });

  const results = await ragChain.invoke({
    input: "La carrera de artes tiene materias de religion en la UCT?",
  });
  console.log(results);
}

main().catch(console.error);
