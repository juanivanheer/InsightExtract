import { OpenAIEmbeddings } from "@langchain/openai";

export const opeenAIEmbeddings = new OpenAIEmbeddings({
  openAIApiKey: process.env.OPEN_AI_KEY,
});
