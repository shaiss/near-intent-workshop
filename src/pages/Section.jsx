
import React, { useState, useEffect } from 'react';
import { workshopStructure } from '@/components/content/workshop-structure';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import SectionContent from '../components/workshop/SectionContent';

export default function Section() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentSection, setCurrentSection] = useState(null);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  useEffect(() => {
    loadSection();
  }, [slug]);

  const loadSection = async () => {
    setLoading(true);
    try {
      // Find the section in the workshop structure
      let foundSection = null;
      let foundPart = null;

      for (const part of workshopStructure.parts) {
        const section = part.sections.find(s => s.slug === slug);
        if (section) {
          foundSection = section;
          foundPart = part;
          break;
        }
      }

      if (foundSection && foundPart) {
        // Dynamically import the content
        const module = await import(`../components/content/part${foundPart.id}/${slug}.js`);
        setContent(module.default);
        setCurrentSection({ ...foundSection, part: foundPart });
      }
    } catch (error) {
      console.error('Error loading section:', error);
    }
    setLoading(false);
  };

  // Navigation functions
  const getAdjacentSections = () => {
    if (!currentSection) return { prev: null, next: null };

    let allSections = [];
    workshopStructure.parts.forEach(part => {
      part.sections.forEach(section => {
        allSections.push({ ...section, part });
      });
    });

    const currentIndex = allSections.findIndex(
      s => s.slug === slug
    );

    return {
      prev: currentIndex > 0 ? allSections[currentIndex - 1] : null,
      next: currentIndex < allSections.length - 1 ? allSections[currentIndex + 1] : null,
    };
  };

  const { prev, next } = getAdjacentSections();

  return (
    <div className="max-w-4xl mx-auto p-6">
      {currentSection && (
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            Part {currentSection.part.id}: {currentSection.part.title}
          </div>
          <h1 className="text-3xl font-bold">
            {currentSection.part.id}.{currentSection.id} {currentSection.title}
          </h1>
        </div>
      )}

      <SectionContent content={content} loading={loading} />

      {/* Navigation */}
      <div className="flex justify-between items-center mt-12 pt-6 border-t">
        <div>
          {prev && (
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`Section?slug=${prev.slug}`))}
              className="flex items-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <div className="flex flex-col items-start">
                <span className="text-xs opacity-70">Previous</span>
                <span className="font-bold">{prev.title}</span>
              </div>
            </Button>
          )}
        </div>
        <div>
          {next && (
            <Button
              variant="outline"
              onClick={() => navigate(createPageUrl(`Section?slug=${next.slug}`))}
              className="flex items-center gap-2"
            >
              <div className="flex flex-col items-end">
                <span className="text-xs opacity-70">Next</span>
                <span className="font-bold">{next.title}</span>
              </div>
              <ChevronRight className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
