import { useToast } from "../ui/use-toast";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import type { PDFDocumentProxy } from "pdfjs-dist";
import { Document, Page } from "react-pdf";
import { useResizeDetector } from "react-resize-detector";

type OnLoadSuccessParams = PDFDocumentProxy;

type PdfDocumentViewerProps = {
  url: string;
  numPages: number;
  currPage?: number;
  scale?: number;
  rotate?: number;
  renderedScale?: number | null;
  onLoadSuccess?: ({ numPages }: OnLoadSuccessParams) => void;
  setRenderedScale?: (value: number | null) => void;
};

const PdfDocumentViewer = ({
  url,
  numPages,
  currPage,
  scale,
  rotate,
  renderedScale,
  onLoadSuccess,
  setRenderedScale,
}: PdfDocumentViewerProps) => {
  const { toast } = useToast();
  const { width, ref } = useResizeDetector();

  const isLoading = renderedScale !== scale;

  const errorToast = () =>
    toast({
      title: "Error loading PDF",
      description: "Please try again later",
      variant: "destructive",
    });

  const pdfLoading = (
    <div className="flex justify-center">
      <Loader2 className="my-24 h-6 w-6 animate-spin" />
    </div>
  );

  const isPageLoading =
    isLoading && renderedScale ? (
      <Page
        width={width ? width : 1}
        pageNumber={currPage}
        scale={scale}
        rotate={rotate}
        key={`@${renderedScale}`}
      />
    ) : null;

  const loadSinglePage = (
    <>
      {isPageLoading}
      <Page
        className={cn(isLoading ? "hidden" : "")}
        key={`@${scale}`}
        width={width ? width : 1}
        pageNumber={currPage}
        scale={scale}
        rotate={rotate}
        loading={pdfLoading}
        onRenderSuccess={() => {
          if (scale && setRenderedScale) setRenderedScale(scale);
        }}
      />
    </>
  );

  const loadFullScreenMode = new Array(numPages)
    .fill(0)
    .map((_, i) => (
      <Page key={i} width={width ? width : 1} pageNumber={i + 1} />
    ));

  return (
    <div ref={ref}>
      <Document
        file={url}
        loading={pdfLoading}
        onLoadError={errorToast}
        onLoadSuccess={onLoadSuccess}
        className="max-h-full"
      >
        {currPage ? loadSinglePage : loadFullScreenMode}
      </Document>
    </div>
  );
};

export default PdfDocumentViewer;
