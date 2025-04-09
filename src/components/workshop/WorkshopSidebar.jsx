import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, RefreshCw, Download } from "lucide-react";
import ContentService from "../../services/ContentService";
import ExportWorkshop from "./ExportWorkshop";

export default function WorkshopSidebar({ onNavigate }) {
  console.log("WorkshopSidebar rendering"); // Debug log
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
      console.log("WorkshopSidebar: Loading workshop structure");
      const workshopStructure = await ContentService.getWorkshopStructure();
      console.log(
        "WorkshopSidebar: Loaded structure:",
        JSON.stringify(workshopStructure, null, 2),
      );

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
        console.log(
          `Expanding part ${part.id}: ${part.title} with ${part.sections?.length || 0} sections`,
        );
        expanded[part.id] = false; // Start without all expanded
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
    return <div className="p-4">Loading workshop structure...</div>;
  }

  return (
    <div className="h-full flex flex-col bg-yellow-200">
      {/* Header with black bottom border */}
      <div className="p-4 bg-yellow-300 border-b-4 border-black">
        <h2 className="text-xl font-bold flex items-center">
          <svg
            className="w-5 h-5 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
          Workshop Outline
        </h2>
      </div>

      <div className="flex-grow overflow-auto">
        <div>
          {structure.parts.map((part) => (
            <div key={part.id} className="border-b border-gray-300">
              <button
                onClick={() => togglePart(part.id)}
                className="w-full px-4 py-3 text-left font-medium flex justify-between items-center hover:bg-yellow-300"
              >
                <span className="font-bold">
                  Part {part.id}: {part.title}
                </span>
                <ChevronRight className={`h-5 w-5 transition-transform ${expandedParts[part.id] ? 'rotate-90' : ''}`} />
              </button>

              {expandedParts[part.id] && (
                <div className="pl-4 pr-2 pb-2">
                  {part.sections.map((section) =>
                    section.slug ? (
                      <Link
                        key={section.id}
                        to={createPageUrl(`Section?slug=${section.slug}`)}
                        className="block py-2 pl-4 pr-2 text-sm hover:bg-yellow-300"
                        onClick={onNavigate}
                      >
                        {part.id}.{section.id} {section.title}
                      </Link>
                    ) : (
                      <div
                        key={section.id}
                        className="block py-2 pl-4 pr-2 text-sm text-gray-500 italic"
                      >
                        {part.id}.{section.id} {section.title} (Coming Soon)
                      </div>
                    ),
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 mt-auto space-y-4">
        <Button
          onClick={refreshContent}
          disabled={refreshing}
          className="w-full neo-button flex items-center justify-center bg-white font-bold text-black border-3 border-black"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
          />
          {refreshing ? "Reloading..." : "Reload Content"}
        </Button>

        {/* Export Workshop Button */}
        <ExportWorkshop />
      </div>
    </div>
  );
}
