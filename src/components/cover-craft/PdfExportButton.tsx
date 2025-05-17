"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileDown } from "lucide-react";

interface PdfExportButtonProps {
  isLetterEmpty: boolean;
}

export function PdfExportButton({ isLetterEmpty }: PdfExportButtonProps) {
  const { toast } = useToast();

  const handleExportPdf = () => {
    toast({
      title: "PDF Export (Mock)",
      description: "PDF export functionality is not yet implemented. This is a placeholder.",
    });
  };

  return (
    <div className="mt-6">
      <Button onClick={handleExportPdf} className="w-full" variant="default" disabled={isLetterEmpty}>
        <FileDown className="mr-2 h-4 w-4" />
        Export as PDF
      </Button>
    </div>
  );
}
