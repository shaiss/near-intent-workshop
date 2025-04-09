import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import ContentService from '../../services/ContentService';
import { Skeleton } from "@/components/ui/skeleton";

export default function WorkshopOutline() {
  console.log("WorkshopOutline rendering"); // Debug log
  const [structure, setStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadWorkshopStructure();
  }, []);

  const loadWorkshopStructure = async () => {
    setLoading(true);
    try {
      const workshopStructure = await ContentService.getWorkshopStructure();
      setStructure(workshopStructure);
    } catch (error) {
      console.error('Error loading workshop structure:', error);
    }
    setLoading(false);
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      await ContentService.refreshAllContent();
      await loadWorkshopStructure();
    } catch (error) {
      console.error('Error refreshing content:', error);
    }
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />

        {[1, 2, 3].map((i) => (
          <div key={i} className="border rounded-lg p-6 space-y-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <div className="space-y-2">
              {[1, 2, 3, 4].map((j) => (
                <Skeleton key={j} className="h-6 w-full" />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{structure.title}</h1>
      </div>

      <p className="text-lg mb-8">{structure.description}</p>

      <div className="space-y-8">
        {structure.parts.map((part) => (
          <div key={part.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">
              Part {part.id}: {part.title}
            </h2>
            <div className="grid gap-2">
              {part.sections.map((section) => (
                <Link
                  key={section.id}
                  to={createPageUrl(`Section?slug=${section.slug}`)}
                  className="p-3 hover:bg-gray-100 rounded-md flex items-center"
                >
                  <span className="text-gray-500 mr-2">
                    {part.id}.{section.id}
                  </span>
                  {section.title}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}