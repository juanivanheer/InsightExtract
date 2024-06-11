import { db } from "@/db";
import { openAIEmbeddings, openai } from "@/lib/openai";
import { pineconeIndex } from "@/lib/pinecone";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { DocumentInterface } from "@langchain/core/dist/documents/document";
import { PineconeStore } from "@langchain/pinecone";
import { OpenAIStream, StreamingTextResponse } from "ai";
import { NextRequest } from "next/server";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

type PreviousMessagesType = {
  id: string;
  text: string;
  isUserMessage: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string | null;
  fileId: string | null;
};

export const POST = async (req: NextRequest) => {
  const body = await req.json();

  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) return new Response("Unauthorized", { status: 401 });

  const { id: userId } = user;
  const { fileId, message } = SendMessageValidator.parse(body);
  const file = await db.file.findFirst({
    where: {
      id: fileId,
      userId,
    },
  });

  if (!file) return new Response("Not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      userId,
      fileId,
    },
  });

  const vectorStore = await PineconeStore.fromExistingIndex(openAIEmbeddings, {
    pineconeIndex,
    namespace: file.id,
  });

  const results = await vectorStore.similaritySearch(message, 4);

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      createdAt: "asc",
    },
    take: 6,
  });

  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo",
    temperature: 0,
    stream: true,
    messages: openAIMessages(prevMessages, results, message),
  });

  const stream = OpenAIStream(response, {
    onCompletion: async (completion) => {
      await db.message.create({
        data: {
          text: completion,
          isUserMessage: false,
          fileId,
          userId,
        },
      });
    },
  });

  return new StreamingTextResponse(stream);
};

const openAIMessages = (
  prevMessages: PreviousMessagesType[],
  results: DocumentInterface<Record<string, any>>[],
  message: string,
): ChatCompletionMessageParam[] => {
  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  return [
    {
      role: "system",
      content:
        "Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format.",
    },
    {
      role: "user",
      content: `Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
      
      \n----------------\n
      
      PREVIOUS CONVERSATION:
      ${formattedPrevMessages.map((message) => {
        if (message.role === "user") return `User: ${message.content}\n`;
        return `Assistant: ${message.content}\n`;
      })}
      
      \n----------------\n
      
      CONTEXT:
      ${results.map((r) => r.pageContent).join("\n\n")}
      
      USER INPUT: ${message}`,
    },
  ];
};
