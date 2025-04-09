
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ContentService from "../../services/ContentService";

export default function ExportWorkshop() {
  const [isExporting, setIsExporting] = useState(false);
  
  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const allContent = await ContentService.exportWorkshopContent();

      // Create a blob and download it
      const blob = new Blob([allContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'near-intents-workshop.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export workshop:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      disabled={isExporting}
      className="w-full neo-button flex items-center justify-center bg-black font-bold text-white border-3 border-black hover:bg-black/90 py-2"
      aria-label="Export workshop content"
    >
      <Download className={`w-4 h-4 mr-2 ${isExporting ? "animate-bounce" : ""}`} aria-hidden="true" />
      {isExporting ? "Exporting..." : "Export Workshop"}
    </Button>
  );
}
