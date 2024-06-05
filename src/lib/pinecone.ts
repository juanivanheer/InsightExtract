import { Pinecone } from "@pinecone-database/pinecone";

const pinecone = new Pinecone();
export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX!);
