import { OpenAIEmbeddings } from "@langchain/openai";
import { QdrantVectorStore } from "@langchain/qdrant";
import { randomUUID } from "crypto";
import fs from "fs/promises";

export async function generateVectorEmbeddings(data , sourceId) {
  try {
    const embeddings = new OpenAIEmbeddings({
      model: "text-embedding-3-small",
      apiKey: process.env.OPENAI_API_KEY,
    });

    const vectorStore = await QdrantVectorStore.fromExistingCollection(
      embeddings,
      {
        url: process.env.QDRUNT_LINK,
        apiKey: process.env.QDRUNT_KEY,
        collectionName: "NoteBookLM",
      },
    );

    const uploadedSources = [];

    for (const document of data) {
      
      const docs = document.chunks.map((chunk, index) => ({
        pageContent: chunk,
        metadata: {
          sourceId,
          title: document.title,
          type: document.type,
          chunkIndex: index,
        },
      }));

      await vectorStore.addDocuments(docs);

      uploadedSources.push({
        sourceId,
        title: document.title,
        type: document.type,
        totalChunks: docs.length,
      });
    }

    return uploadedSources;
  } catch (error) {
    console.log(`${error.message}`);
    throw error;
  }
}
