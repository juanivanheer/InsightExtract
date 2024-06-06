import { pineconeIndex } from "../../../lib/pinecone";
import { db } from "@/db";
import { openAIEmbeddings } from "@/lib/openai";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { PineconeStore } from "@langchain/pinecone";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { type FileRouter, createUploadthing } from "uploadthing/next";

const f = createUploadthing();

export const ourFileRouter = {
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(async ({ req }) => {
      const { getUser } = getKindeServerSession();
      const user = await getUser();

      if (!user || !user.id) throw new Error("Unauthorized");

      return { userId: user.id };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: file.url,
          uploadStatus: "PROCESSING",
        },
      });

      try {
        const response = await fetch(file.url);
        const blob = await response.blob();

        const loader = new PDFLoader(blob);
        const pageLevelDocs = await loader.load();

        // const pagesAmt = pageLevelDocs.length;

        await PineconeStore.fromDocuments(pageLevelDocs, openAIEmbeddings, {
          pineconeIndex,
          namespace: createdFile.id,
        });

        await db.file.update({
          data: {
            uploadStatus: "SUCCESS",
          },
          where: {
            id: createdFile.id,
          },
        });
      } catch (error) {
        console.log(error);
        await db.file.update({
          data: {
            uploadStatus: "FAILED",
          },
          where: {
            id: createdFile.id,
          },
        });
      }
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
