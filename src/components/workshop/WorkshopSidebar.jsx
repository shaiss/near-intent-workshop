import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, RefreshCw } from "lucide-react";
import ContentService from "../../services/ContentService";

export default function WorkshopSidebar() {
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
      setStructure(workshopStructure);

      // Initialize expanded state
      const expanded = {};
      workshopStructure.parts.forEach((part) => {
        expanded[part.id] = true; // Start with all expanded
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
    <div className="h-full flex flex-col">
      <div className="p-4">
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
          NEAR INTENTS
        </h2>
      </div>

      <div className="flex-grow overflow-auto">
        <div className="space-y-1">
          {structure.parts.map((part) => (
            <div key={part.id} className="border-b last:border-b-0">
              <button
                onClick={() => togglePart(part.id)}
                className="w-full px-4 py-2 text-left font-medium flex justify-between items-center hover:bg-gray-100"
              >
                <span>
                  Part {part.id}: {part.title}
                </span>
                {expandedParts[part.id] ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {expandedParts[part.id] && (
                <div className="pl-4 pr-2 pb-2">
                  {part.sections.map((section) => (
                    <Link
                      key={section.id}
                      to={createPageUrl(`Section?slug=${section.slug}`)}
                      className="block py-1.5 pl-4 pr-2 text-sm hover:bg-gray-100 rounded"
                    >
                      {part.id}.{section.id} {section.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4 border-t mt-auto">
        <Button 
          variant="ghost"
          size="sm" 
          onClick={refreshContent}
          disabled={refreshing}
          className="w-full bg-white text-black neo-button font-bold flex items-center justify-center"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Reload Content
        </Button>
      </div>
    </div>
  );
}
