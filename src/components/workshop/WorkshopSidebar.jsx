import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, RefreshCw, Download, FileText } from "lucide-react";
import ContentService from "../../services/ContentService";
import ExportWorkshop from "./ExportWorkshop";

export default function WorkshopSidebar({ onNavigate }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [expandedParts, setExpandedParts] = useState({});

  useEffect(() => {
    loadWorkshopStructure();
  }, []);

  const loadWorkshopStructure = async () => {
    setLoading(true);
    try {
      const workshopStructure = await ContentService.getWorkshopStructure();

      if (
        !workshopStructure ||
        !workshopStructure.parts ||
        workshopStructure.parts.length === 0
      ) {
        console.error(
          "Workshop structure is empty or invalid:",
          workshopStructure,
        );
        setLoading(false);
        return;
      }

      setStructure(workshopStructure);

      // Initialize expanded state
      const expanded = {};
      workshopStructure.parts.forEach((part) => {
        expanded[part.id] = false; // Start with all collapsed
      });
      setExpandedParts(expanded);
    } catch (error) {
      console.error("Error loading workshop structure:", error);
    }
    setLoading(false);
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      await ContentService.refreshAllContent();
      await loadWorkshopStructure();
    } catch (error) {
      console.error("Error refreshing content:", error);
    }
    setRefreshing(false);
  };

  const togglePart = (partId) => {
    setExpandedParts((prev) => ({
      ...prev,
      [partId]: !prev[partId],
    }));
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-yellow-200 p-4">
        <div className="animate-pulse text-center">
          <div className="h-8 w-48 bg-yellow-300 rounded mb-4 mx-auto"></div>
          <div className="h-4 w-36 bg-yellow-300 rounded mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-yellow-100">
      {/* Header with black bottom border */}
      <div className="p-4 bg-yellow-300 border-b-4 border-black flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        <h2 className="text-xl font-bold">NEAR INTENTS</h2>
      </div>
      
      <div className="p-4 bg-yellow-200 border-b-2 border-black flex items-center">
        <FileText className="w-5 h-5 mr-2" />
        <h3 className="text-lg font-bold">Workshop Outline</h3>
      </div>

      <div className="flex-grow overflow-auto">
        <nav aria-label="Workshop navigation">
          {structure.parts.map((part) => {
            // Choose background color based on part ID
            let partBgColor = "bg-yellow-100";
            if (part.id === 1) partBgColor = "bg-pink-200";
            else if (part.id === 2) partBgColor = "bg-green-200";
            else if (part.id === 3) partBgColor = "bg-blue-200";
            else if (part.id === 4) partBgColor = "bg-orange-200";
            else if (part.id === 5) partBgColor = "bg-purple-200";
            
            return (
              <div key={part.id} className="border-b-2 border-black">
                <button
                  onClick={() => togglePart(part.id)}
                  className={`w-full px-4 py-3 text-left font-medium flex justify-between items-center ${partBgColor} hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-black focus:ring-inset`}
                  aria-expanded={expandedParts[part.id]}
                  aria-controls={`part-${part.id}-sections`}
                >
                  <span className="font-bold">
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-black text-white rounded-full mr-2 text-sm">
                      {part.id}
                    </span>
                    {part.title}
                  </span>
                  <ChevronRight 
                    className={`h-5 w-5 transition-transform duration-200 ${
                      expandedParts[part.id] ? "rotate-90" : ""
                    }`} 
                    aria-hidden="true"
                  />
                </button>

                {expandedParts[part.id] && (
                  <div 
                    id={`part-${part.id}-sections`}
                    className={`border-t border-black/20 ${partBgColor} bg-opacity-50`}
                  >
                    {part.sections.map((section) => (
                      <div key={section.id} className="relative">
                        {section.slug ? (
                          <Link
                            to={createPageUrl(`Section?slug=${section.slug}`)}
                            className="block py-2 px-4 pl-8 text-sm hover:bg-black hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black relative transition-colors duration-200"
                            onClick={onNavigate}
                          >
                            <span className="flex items-center">
                              <span className="w-6 inline-block">{part.id}.{section.id}</span>
                              <span>{section.title}</span>
                            </span>
                          </Link>
                        ) : (
                          <div className="block py-2 px-4 pl-8 text-sm text-gray-500 italic">
                            <span className="flex items-center">
                              <span className="w-6 inline-block">{part.id}.{section.id}</span>
                              <span>{section.title} (Coming Soon)</span>
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto space-y-4 border-t-2 border-black bg-yellow-100">
        <Button
          onClick={refreshContent}
          disabled={refreshing}
          className="w-full neo-button flex items-center justify-center bg-white font-bold text-black border-3 border-black transition-transform"
          aria-label={refreshing ? "Reloading content" : "Reload workshop content"}
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            aria-hidden="true"
          />
          {refreshing ? "Reloading..." : "Reload Content"}
        </Button>

        <ExportWorkshop />
      </div>
    </div>
  );
}