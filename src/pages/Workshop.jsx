import React, { useState, useEffect } from 'react';
import { WorkshopPart } from '@/api/entities';
import { WorkshopSection } from '@/api/entities';
import WorkshopOutline from '../components/workshop/WorkshopOutline';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ChevronLeft, ChevronRight, Home } from "lucide-react";
import ReactMarkdown from 'react-markdown';

export default function Workshop() {
  const [currentPart, setCurrentPart] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allParts, setAllParts] = useState([]);
  const [allSections, setAllSections] = useState([]);
  
  const urlParams = new URLSearchParams(window.location.search);
  const partId = urlParams.get('part');
  const sectionId = urlParams.get('section');
  
  const navigate = useNavigate();

  useEffect(() => {
    async function loadAllData() {
      try {
        // Load all parts and sections for navigation
        const partsData = await WorkshopPart.list("order");
        const sectionsData = await WorkshopSection.list("order");
        
        setAllParts(partsData);
        setAllSections(sectionsData);
      } catch (error) {
        console.error("Error loading workshop data:", error);
      }
    }
    
    loadAllData();
  }, []);

  useEffect(() => {
    async function loadCurrentSection() {
      if (!partId || !sectionId) {
        setLoading(false);
        return;
      }
      
      try {
        setLoading(true);
        
        // Get the part
        const partData = await WorkshopPart.filter({
          id: parseInt(partId)
        });
        
        // Get the section
        const sectionData = await WorkshopSection.filter({
          part_id: parseInt(partId),
          section_number: parseFloat(sectionId)
        });
        
        if (partData.length && sectionData.length) {
          setCurrentPart(partData[0]);
          setCurrentSection(sectionData[0]);
        }
      } catch (error) {
        console.error("Error loading content:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadCurrentSection();
  }, [partId, sectionId]);

  // Get previous and next sections for navigation
  const getAdjacentSections = () => {
    if (!allSections.length || !currentSection) return { prev: null, next: null };
    
    // Sort sections by part_id and then by section_number
    const sortedSections = [...allSections].sort((a, b) => {
      if (a.part_id !== b.part_id) return a.part_id - b.part_id;
      return a.section_number - b.section_number;
    });
    
    const currentIdx = sortedSections.findIndex(
      s => s.part_id === currentSection.part_id && s.section_number === currentSection.section_number
    );
    
    return {
      prev: currentIdx > 0 ? sortedSections[currentIdx - 1] : null,
      next: currentIdx < sortedSections.length - 1 ? sortedSections[currentIdx + 1] : null
    };
  };

  const navigateToSection = (section) => {
    if (!section) return;
    navigate(createPageUrl('Workshop', `part=${section.part_id}&section=${section.section_number}`));
  };

  const goToHome = () => {
    navigate(createPageUrl('Workshop'));
  };

  // If no part/section selected, show the outline
  if (!partId || !sectionId) {
    return <WorkshopOutline />;
  }

  // Show loading state
  if (loading) {
    return <div className="p-6 text-center">Loading workshop content...</div>;
  }

  // Show error if section not found
  if (!currentPart || !currentSection) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Section not found</h2>
        <Button onClick={goToHome}>Return to Workshop Outline</Button>
      </div>
    );
  }

  const { prev, next } = getAdjacentSections();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" size="sm" onClick={goToHome}>
          <Home className="w-4 h-4 mr-2" />
          Workshop Outline
        </Button>
        <div className="text-sm text-gray-500">
          Part {currentPart.id}: {currentPart.title}
        </div>
      </div>
      
      <Card className="p-8 mb-6">
        <h1 className="text-2xl font-bold mb-6">
          {currentPart.id}.{currentSection.section_number} {currentSection.title}
        </h1>
        
        <div className="prose max-w-none">
          <ReactMarkdown>{currentSection.content}</ReactMarkdown>
        </div>
      </Card>
      
      <div className="flex justify-between mt-6">
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