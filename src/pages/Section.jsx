import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import SectionContent from '../components/workshop/SectionContent';
import ContentService from '../services/ContentService';

export default function Section() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentSection, setCurrentSection] = useState(null);
  const [workshopStructure, setWorkshopStructure] = useState(null);
  const navigate = useNavigate();

  const urlParams = new URLSearchParams(window.location.search);
  const slug = urlParams.get('slug');

  useEffect(() => {
    loadWorkshopStructure();
  }, []);

  useEffect(() => {
    if (workshopStructure && slug) {
      loadSection();
    }
  }, [slug, workshopStructure]);

  const loadWorkshopStructure = async () => {
    try {
      const structure = await ContentService.getWorkshopStructure();
      setWorkshopStructure(structure);
    } catch (error) {
      console.error('Error loading workshop structure:', error);
    }
  };

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
        // Check if the slug already contains a path (with '../' or a folder structure)
        let contentPath;
        if (slug.includes('/')) {
          contentPath = slug.endsWith('.md') ? slug : `${slug}.md`;
        } else {
          // Use the old-style flat structure approach for backward compatibility
          contentPath = `${slug}.md`;
        }
        
        try {
          // First try to load using the direct slug
          const markdown = await ContentService.getContent(contentPath);
          setContent(markdown);
          setCurrentSection({ ...foundSection, part: foundPart });
        } catch (error) {
          console.error(`Failed to load content with path ${contentPath}:`, error);
          
          // If that fails and the slug doesn't have a folder structure,
          // try to construct a path based on the workshop structure
          if (!slug.includes('/')) {
            const folderPrefix = `${String(foundPart.id).padStart(2, '0')}-${foundPart.title.toLowerCase().replace(/\s+/g, '-')}`;
            const filePrefix = `${String(foundSection.id).padStart(2, '0')}-${slug}`;
            const newPath = `${folderPrefix}/${filePrefix}.md`;
            
            console.log(`Trying constructed path: ${newPath}`);
            const markdown = await ContentService.getContent(newPath);
            setContent(markdown);
            setCurrentSection({ ...foundSection, part: foundPart });
          } else {
            throw error; // Re-throw if we've already tried the path-based approach
          }
        }
      }
    } catch (error) {
      console.error('Error loading section:', error);
    }
    setLoading(false);
  };

  const refreshContent = async () => {
    setRefreshing(true);
    try {
      await ContentService.refreshContent(`${slug}.md`);
      await loadSection();
    } catch (error) {
      console.error('Error refreshing content:', error);
    }
    setRefreshing(false);
  };

  // Navigation functions
  const getAdjacentSections = () => {
    if (!currentSection || !workshopStructure) return { prev: null, next: null };

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

  const navigateToSection = (section) => {
    if (!section) return;
    navigate(createPageUrl(`Section?slug=${section.slug}`));
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {currentSection && (
        <div className="mb-8">
          <div className="text-sm text-gray-500 mb-2">
            Part {currentSection.part.id}: {currentSection.part.title}
          </div>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">
              {currentSection.part.id}.{currentSection.id} {currentSection.title}
            </h1>
          </div>
        </div>
      )}

      <SectionContent 
        content={content} 
        loading={loading} 
        sectionTitle={currentSection?.title} 
      />

      <div className="flex justify-between mt-8">
        <Button 
          variant="outline" 
          onClick={() => navigateToSection(prev)}
          disabled={!prev}
        >
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        
        <Button 
          variant="outline" 
          onClick={() => navigateToSection(next)}
          disabled={!next}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
