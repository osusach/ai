import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";
import { Ollama } from "@langchain/community/llms/ollama";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { createRetrievalChain } from "langchain/chains/retrieval";
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { TextLoader } from "langchain/document_loaders/fs/text";
import {
  type Runnable,
  type RunnableInterface,
} from "@langchain/core/runnables";
import type { BaseMessage } from "@langchain/core/messages";
import type { DocumentInterface, Document } from "@langchain/core/documents";
import { RunnableSequence } from "@langchain/core/runnables";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

type rag = Runnable<
  {
    input: string;
    chat_history?: BaseMessage[] | string;
  } & {
    [key: string]: unknown;
  },
  {
    context: Document[];
    answer: any;
  } & {
    [key: string]: unknown;
  }
>;

type docsChain = RunnableSequence<Record<string, unknown>, Exclude<any, Error>>;

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

export class AI {
  private store: MemoryVectorStore;
  private rag: rag;
  private docsChain: docsChain;

  constructor(store: MemoryVectorStore, rag: rag, docsChain: docsChain) {
    this.store = store;
    this.rag = rag;
    this.docsChain = docsChain;
  }

  public static async create({ llmModel, embedModel }) {
    const llm = new Ollama({
      model: llmModel,
    });
    const store = new MemoryVectorStore(
      new OllamaEmbeddings({
        model: embedModel,
      })
    );

    const docsChain = await createStuffDocumentsChain({ llm, prompt });
    const rag = await createRetrievalChain({
      retriever: store.asRetriever(),
      combineDocsChain: docsChain,
    });

    return new AI(store, rag, docsChain);
  }

  /**
   * 
   * @param paths FOLDER PATH, NOT FILE PATH
   */
  public async storePDFs(paths: string[]) {
    const textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });

    for (let i = 0; i < paths.length; i++) {
      
      const path = paths[i];
      const loader = new DirectoryLoader(
        path,
        {
          ".txt": (path) => new TextLoader(path),
          ".pdf": (path) => new PDFLoader(path),
          ".md": (path) => new UnstructuredLoader(path, {
            apiKey: process.env.MD_API,
            apiUrl: process.env.MD_URL,
            chunkingStrategy: "by_title",
          }),
        }
      );
      
      const docs = await loader.load();
      
      const splits = await textSplitter.splitDocuments(docs);
      await this.store.addDocuments(splits);
    }

    this.rag = await createRetrievalChain({
      retriever: this.store.asRetriever(),
      combineDocsChain: this.docsChain,
    });
  }

  public async ask(input: string) {
    const results = await this.rag.invoke({
      input,
    });

    return results;
  }
}
