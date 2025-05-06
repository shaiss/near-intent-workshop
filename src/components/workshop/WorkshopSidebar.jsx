import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronRight, FileText } from "lucide-react";
import ContentService from "../../services/ContentService";
import ExportWorkshop from "./ExportWorkshop";
import PropTypes from "prop-types";

export default function WorkshopSidebar({ onNavigate, workshopTitle }) {
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
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
      {/* Workshop Title Header - visually prominent */}
      <div className="p-4 bg-yellow-300 border-b-4 border-black flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-6 h-6" />
          <span className="text-2xl font-extrabold tracking-tight uppercase drop-shadow-sm">{workshopTitle}</span>
        </div>
      </div>
      {/* Section Header - visually subordinate */}
      <div className="px-4 py-2 bg-yellow-200 border-b-2 border-black flex items-center">
        <FileText className="w-4 h-4 mr-2 opacity-70" />
        <h2 className="text-base font-semibold text-gray-700 tracking-wide">Workshop Outline</h2>
      </div>

      <div className="flex-grow overflow-auto">
        <nav aria-label="Workshop navigation">
          {structure.parts.map((part, index) => {
            // Alternate between light background colors
            let partBgColor =
              index % 2 === 0 ? "bg-yellow-100" : "bg-yellow-50";

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
                    className={`border-t border-black/20 ${partBgColor}`}
                  >
                    {part.sections.map((section) => {
                      // Check if this is the current active section based on URL
                      const isActive = window.location.href.includes(
                        `slug=${section.slug}`,
                      );

                      return (
                        <div key={section.id} className="relative">
                          {section.slug ? (
                            <Link
                              to={createPageUrl(`Section?slug=${section.slug}`)}
                              className={`sidebar-section block py-2 px-4 pl-8 text-sm hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-black relative transition-colors duration-200 ${isActive ? "selected" : ""}`}
                              onClick={onNavigate}
                            >
                              <span className="flex items-center">
                                <span className="w-10 inline-block">
                                  {part.id}.{section.id}
                                </span>
                                <span>{section.title}</span>
                              </span>
                            </Link>
                          ) : (
                            <div className="block py-2 px-4 pl-8 text-sm text-gray-500 italic">
                              <span className="flex items-center">
                                <span className="w-10 inline-block">
                                  {part.id}.{section.id}
                                </span>
                                <span>{section.title} (Coming Soon)</span>
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="p-4 mt-auto border-t-2 border-black bg-yellow-100">
        <ExportWorkshop />
      </div>
    </div>
  );
}

WorkshopSidebar.propTypes = {
  onNavigate: PropTypes.func,
  workshopTitle: PropTypes.string,
}; 