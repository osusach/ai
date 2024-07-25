import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { UnstructuredLoader } from "@langchain/community/document_loaders/fs/unstructured";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

export async function pdfPipe(args: { path: string }) {
  const loader = new PDFLoader(args.path);

  const docs = await loader.load();

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 512,
    chunkOverlap: 128,
  });

  const chunks = await splitter.splitDocuments(docs);
  return chunks;
}
