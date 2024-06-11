import { useState } from "react";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { Button } from "../ui/button";
import { Expand } from "lucide-react";
import SimpleBar from "simplebar-react";
import PdfDocumentViewer from "./PdfDocumentViewer";

type PdfFullScreeenProps = {
  url: string;
  numPages: number;
  currPage: number;
};

const PdfFullScreeen = ({ url, numPages, currPage }: PdfFullScreeenProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const openChangeAction = (v: boolean) => {
    if (!v) {
      setIsOpen(v);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={openChangeAction}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button aria-label="fullscreen" variant="ghost" className="gap-1.5">
          <Expand className="h-4 w-4"></Expand>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-7xl w-full">
        <SimpleBar autoHide={false} className="max-h-[calc(100vh-10rem)]">
          <PdfDocumentViewer
            url={url}
            numPages={numPages}
          />
        </SimpleBar>
      </DialogContent>
    </Dialog>
  );
};

export default PdfFullScreeen;
