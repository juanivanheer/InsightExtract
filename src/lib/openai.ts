import { OpenAIEmbeddings } from "@langchain/openai";
import OpenAI from "openai";

export const openAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPEN_AI_KEY,
});

export const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY!,
});
