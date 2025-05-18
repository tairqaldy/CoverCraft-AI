
"use client";

import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown, Loader2 } from "lucide-react";
import { useState } from "react";

interface PdfExportButtonProps {
  letterContent: string;
  fileName?: string;
}

export function PdfExportButton({ letterContent, fileName = "cover-letter.pdf" }: PdfExportButtonProps) {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPdf = () => {
    if (!letterContent || letterContent.trim() === "") {
      toast({
        variant: "destructive",
        title: "Cannot Export",
        description: "There is no content to export to PDF.",
      });
      return;
    }

    setIsExporting(true);

    try {
      const doc = new jsPDF();

      // Set document properties (optional)
      doc.setProperties({
        title: fileName.replace(".pdf", ""),
        subject: "Generated Letter",
        author: "CoverCraft AI",
      });

      // Add text content
      // A4 page size: 210mm width, 297mm height
      // Margins: 15mm (common default)
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight(); // Not directly used for auto-paging text
      const margin = 15;
      const FONT_SIZE = 12;
      const LINE_HEIGHT_FACTOR = 1.5; // Adjust as needed for line spacing in PDF
      
      doc.setFontSize(FONT_SIZE);
      
      // The 'splitTextToSize' method helps in manual text wrapping if needed,
      // but doc.text with maxWidth option handles automatic wrapping.
      const textLines = doc.splitTextToSize(letterContent, pageWidth - margin * 2);
      
      // doc.text will handle paging automatically if content exceeds one page
      doc.text(textLines, margin, margin, {
        maxWidth: pageWidth - margin * 2,
        lineHeightFactor: LINE_HEIGHT_FACTOR,
      });
      
      doc.save(fileName);

      toast({
        title: "PDF Exported",
        description: `Your letter has been saved as ${fileName}.`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast({
        variant: "destructive",
        title: "PDF Export Failed",
        description: "An unexpected error occurred while exporting to PDF.",
      });
    } finally {
      setIsExporting(false);
    }
  };
  
  const isLetterEmpty = !letterContent || letterContent.trim() === "";

  return (
    <div className="mt-6">
      <Button onClick={handleExportPdf} className="w-full" variant="default" disabled={isLetterEmpty || isExporting}>
        {isExporting ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <FileDown className="mr-2 h-4 w-4" />
        )}
        {isExporting ? "Exporting..." : "Export as PDF"}
      </Button>
    </div>
  );
}
