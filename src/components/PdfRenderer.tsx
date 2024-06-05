"use client";

import PdfDocumentViewer from "./PdfDocumentViewer";
import PdfFullScreeen from "./PdfFullScreen";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronDown, ChevronUp, RotateCw, Search } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { KeyboardEvent, useState } from "react";
import { useForm } from "react-hook-form";
import { pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import SimpleBar from "simplebar-react";
import { z } from "zod";

type PdfRendererProps = {
  url: string;
};

type OnLoadSuccessParams = PDFDocumentProxy;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [renderedScale, setRenderedScale] = useState<number | null>(null);

  const CustomPageValidator = z.object({
    page: z
      .string()
      .refine((num) => Number(num) > 0 && Number(num) <= numPages!),
  });
  type TCustomPageValidator = z.infer<typeof CustomPageValidator>;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<TCustomPageValidator>({
    defaultValues: {
      page: "1",
    },
    resolver: zodResolver(CustomPageValidator),
  });

  const onLoadSuccess = ({ numPages }: OnLoadSuccessParams) =>
    setNumPages(numPages);

  const handlePageSubmit = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSubmit(({ page }: TCustomPageValidator) => {
        setCurrPage(Number(page));
        setValue("page", page);
      })();
    }
  };

  const onChevronDownClick = () => {
    setCurrPage((prev) => (prev - 1 > 1 ? prev - 1 : 1));
    setValue("page", String(currPage - 1));
  };

  const onChevronUpClick = () => {
    setCurrPage((prev) => (prev + 1 > numPages! ? numPages! : prev + 1));
    setValue("page", String(currPage + 1));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            aria-label="previous-page"
            onClick={onChevronDownClick}
            disabled={currPage <= 1}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-1.5">
            <Input
              {...register("page")}
              onKeyDown={handlePageSubmit}
              className={cn(
                "w-12 h-8",
                errors.page && "focus-visible:ring-red-500",
              )}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>
          <Button
            variant="ghost"
            aria-label="previous-page"
            onClick={onChevronUpClick}
            disabled={numPages === undefined || numPages === currPage}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}% <ChevronDown className="h-3 w-3 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setScale(1)}>
                100%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(1.5)}>
                150%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2)}>
                200%
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setScale(2.5)}>
                250%
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            aria-label="rotate 90 degrees"
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
          >
            <RotateCw className="h-4 w-4" />
          </Button>

          <PdfFullScreeen url={url} currPage={currPage} numPages={numPages!} />
        </div>
      </div>

      <div className="flex-1 w-full max-h-screen">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <PdfDocumentViewer
            currPage={currPage}
            numPages={numPages!}
            url={url}
            onLoadSuccess={onLoadSuccess}
            rotate={rotation}
            scale={scale}
            renderedScale={renderedScale}
            setRenderedScale={setRenderedScale}
          />
        </SimpleBar>
      </div>
    </div>
  );
};

export default PdfRenderer;
