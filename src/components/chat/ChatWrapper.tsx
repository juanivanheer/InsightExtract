"use client";

import { buttonVariants } from "../ui/button";
import { ChatContextProvider } from "./ChatContext";
import ChatInput from "./ChatInput";
import Messages from "./Messages";
import { trpc } from "@/app/_trpc/client";
import { $Enums } from "@prisma/client";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

type ChatWrapperProps = {
  fileId: string;
};

const ChatWrapper = ({ fileId }: ChatWrapperProps) => {
  const { data, isLoading } = trpc.getFileUploadStatus.useQuery(
    { fileId },
    {
      refetchInterval: ({ state: { data } }) =>
        data?.status === "SUCCESS" || data?.status === "FAILED" ? false : 500,
    },
  );

  const chatStage = (status: $Enums.UploadStatus | undefined) => (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 flex justify-center items-center flex-col mb-28">
        <div className="flex flex-col items-center gap-2">
          {status === "FAILED" ? (
            <XCircle className="h-8 w-8 text-red-500" />
          ) : (
            <Loader2 className="h-8 w-8 text-green-500 animate-spin" />
          )}
          <h3 className="font-semibold text-xl">
            {status === "PROCESSING"
              ? "Processing PDF..."
              : status === "FAILED"
                ? "Too many pages in PDF."
                : "Loading..."}
          </h3>
          <p className="text-zinc-500 text-sm">
            {status === "PROCESSING" ? (
              <span>This won&apos;t take long.</span>
            ) : status === "FAILED" ? (
              <span>
                Your <span className="font-medium">Free</span> plan supports up
                to 5 pages per PDF.
              </span>
            ) : (
              <span>We&apos;re preparing your PDF.</span>
            )}
          </p>
          {status === "FAILED" ? (
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );

  if (isLoading) return chatStage(undefined);

  if (data?.status === "PROCESSING") return chatStage("PROCESSING");

  if (data?.status === "FAILED") return chatStage("FAILED");

  return (
    <ChatContextProvider fileId={fileId}>
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 justify-between flex flex-col mb-28">
          <Messages fileId={fileId} />
        </div>

        <ChatInput isDisabled={false} />
      </div>
    </ChatContextProvider>
  );
};

export default ChatWrapper;
