
import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Home, FileText } from 'lucide-react';
import { Button } from "@/components/ui/button";

export default function ContentNavigation({ currentSlug }) {
  // Load current section from ContentService to highlight active item
  
  return (
    <div className="bg-gray-100 p-4 mb-6 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Link to="/">
            <Button variant="ghost" size="sm">
              <Home className="h-5 w-5 mr-2" />
              Home
            </Button>
          </Link>
          <Link to={createPageUrl('Workshop')}>
            <Button variant="ghost" size="sm">
              <FileText className="h-5 w-5 mr-2" />
              Workshop Outline
            </Button>
          </Link>
        </div>
        
        <div className="text-sm text-gray-500">
          {currentSlug && `Current: ${currentSlug}`}
        </div>
      </div>
    </div>
  );
}
