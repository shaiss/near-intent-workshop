import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { workshopStructure } from '@/components/content/workshop-structure';

export default function WorkshopOutline() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{workshopStructure.title}</h1>
      <p className="text-lg mb-8">{workshopStructure.description}</p>
      
      <div className="space-y-8">
        {workshopStructure.parts.map((part) => (
          <div key={part.id} className="border rounded-lg p-6">
            <h2 className="text-xl font-bold mb-2">
              Part {part.id}: {part.title}
            </h2>
            <p className="text-gray-600 mb-4">{part.description}</p>
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