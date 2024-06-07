import { privateProcedure, publicProcedure, router } from "./trpc";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

export const appRouter = router({
  authCallback: publicProcedure.query(async () => {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user?.id || !user?.email)
      throw new TRPCError({ code: "UNAUTHORIZED" });

    const dbUser = await db.user.findFirst({
      where: {
        id: user.id,
      },
    });

    if (!dbUser) {
      await db.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    return { success: true };
  }),
  getUserFiles: privateProcedure.query(
    async ({
      ctx: {
        user: { id: userId },
      },
    }) => {
      return await db.file.findMany({ where: { userId } });
    },
  ),
  getFileUploadStatus: privateProcedure
    .input(z.object({ fileId: z.string() }))
    .query(
      async ({
        input: { fileId: id },
        ctx: {
          user: { id: userId },
        },
      }) => {
        const file = await db.file.findFirst({
          where: {
            id,
            userId,
          },
        });

        if (!file) return { status: "PENDING" as const };

        return { status: file.uploadStatus };
      },
    ),
  getFile: privateProcedure.input(z.object({ key: z.string() })).mutation(
    async ({
      ctx: {
        user: { id: userId },
      },
      input: { key },
    }) => {
      const file = await db.file.findFirst({
        where: {
          key,
          userId,
        },
      });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      return file;
    },
  ),
  deleteFile: privateProcedure.input(z.object({ id: z.string() })).mutation(
    async ({
      ctx: {
        user: { id: userId },
      },
      input: { id },
    }) => {
      const file = await db.file.findFirst({ where: { id, userId } });

      if (!file) throw new TRPCError({ code: "NOT_FOUND" });

      await db.file.delete({ where: { id } });

      return file;
    },
  ),
  getFileMessages: privateProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        fileId: z.string(),
      }),
    )
    .query(
      async ({
        ctx: {
          user: { id: userId },
        },
        input: { fileId, cursor, limit },
      }) => {
        const inputLimit = limit ?? INFINITE_QUERY_LIMIT;
        const file = await db.file.findFirst({
          where: {
            id: fileId,
            userId,
          },
        });

        if (!file) throw new TRPCError({ code: "NOT_FOUND" });

        const messages = await db.message.findMany({
          take: inputLimit + 1,
          where: {
            fileId,
          },
          orderBy: {
            createdAt: "desc",
          },
          cursor: cursor ? { id: cursor } : undefined,
          select: {
            id: true,
            isUserMessage: true,
            createdAt: true,
            text: true,
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (messages.length > inputLimit) {
          const nextItem = messages.pop();
          nextCursor = nextItem?.id;
        }

        return {
          messages,
          nextCursor,
        };
      },
    ),
});

export type AppRouter = typeof appRouter;
