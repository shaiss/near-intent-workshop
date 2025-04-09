
import React, { useState } from 'react';
import ContentService from '../../services/ContentService';
import { Button } from "@/components/ui/button";
import { Download, FileDown, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

export default function ExportWorkshop() {
  const [exporting, setExporting] = useState(false);
  const { toast } = useToast();

  const exportToMarkdown = async () => {
    setExporting(true);
    try {
      // Get the workshop structure
      const structure = await ContentService.getWorkshopStructure();
      
      // Initialize the markdown content with the title and description
      let markdownContent = `# ${structure.title}\n\n${structure.description}\n\n`;
      
      // Process each part and its sections
      for (const part of structure.parts) {
        markdownContent += `## ${part.title}\n\n`;
        
        // Process each section within the part
        for (const section of part.sections) {
          // Get the content for this section
          const sectionContent = await ContentService.getContent(`${section.slug}.md`);
          markdownContent += `### ${section.title}\n\n${sectionContent}\n\n`;
        }
      }
      
      // Create a downloadable file
      const blob = new Blob([markdownContent], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'near-intents-workshop.md';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Successful",
        description: "Workshop content has been exported to Markdown",
      });
    } catch (error) {
      console.error('Error exporting workshop:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the workshop content",
        variant: "destructive",
      });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={exportToMarkdown}
      disabled={exporting}
      className="w-full bg-white text-black neo-button font-bold flex items-center justify-center"
    >
      {exporting ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Exporting...
        </>
      ) : (
        <>
          <FileDown className="w-4 h-4 mr-2" />
          Export Workshop
        </>
      )}
    </Button>
  );
}
