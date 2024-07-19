import "pdf-parse";
import ollama from "ollama";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { Ollama } from "@langchain/community/llms/ollama";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

async function main() {
  const loader = new PDFLoader("./files/uct_artes.pdf");

  const docs = await loader.load();

  // console.log(docs[0].pageContent.slice(0, 100));
  // console.log(docs[0].metadata);

  const llm = new Ollama({
    model: "llama3"
  });

  // Ejemplo de prompt simple:

  // const stream = await llm.stream(
  //   `Translate "I love programming" into German.`
  // );

  // const chunks: string[] = [];
  // for await (const chunk of stream) {
  //   chunks.push(chunk);
  // }

  // console.log(chunks.join(""));

  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,
    chunkOverlap: 200,
  });

  const splits = await textSplitter.splitDocuments(docs);

  const vectorstore = await MemoryVectorStore.fromDocuments(
    splits,
    new OllamaEmbeddings({
      model: "nomic-embed-text",
    })
  );

  const retriever = vectorstore.asRetriever();

  const systemTemplate = [
    `You are an assistant for question-answering tasks. `,
    `Use the following pieces of retrieved context to answer `,
    `the question. If you don't know the answer, say that you `,
    `don't know. Use three sentences maximum and keep the `,
    `answer concise.`,
    `Responde en español`,
    `\n\n`,
    `{context}`,
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
