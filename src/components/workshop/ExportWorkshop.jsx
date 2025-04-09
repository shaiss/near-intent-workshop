import React from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import ContentService from "../../services/ContentService";

export default function ExportWorkshop() {
  const handleExportPDF = async () => {
    try {
      const workshopStructure = await ContentService.getWorkshopStructure();
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
    }
  };

  return (
    <Button
      onClick={handleExportPDF}
      className="w-full neo-button flex items-center justify-center bg-white font-bold text-black border-3 border-black"
    >
      <Download className="w-4 h-4 mr-2" />
      Export Workshop
    </Button>
  );
}