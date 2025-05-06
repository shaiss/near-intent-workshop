// eslint-disable-next-line no-unused-vars
import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import mermaid from 'mermaid';

// Configure mermaid with simpler options
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
  flowchart: { useMaxWidth: false, htmlLabels: true },
  sequence: { useMaxWidth: false },
  classDiagram: { useMaxWidth: false }
});

export default function MermaidDiagram({ chart }) {
  const containerRef = useRef(null);
  // Generate a unique ID for this diagram instance
  const uniqueId = useRef(`mermaid-diagram-${Math.random().toString(36).substring(2, 11)}`);
  
  useEffect(() => {
    // Skip if no container or chart
    if (!containerRef.current || !chart) return;
    
    // Clear previous content
    containerRef.current.innerHTML = '';
    
    const renderDiagram = async () => {
      try {
        // Use the recommended approach with mermaid.render()
        const { svg, bindFunctions } = await mermaid.render(
          uniqueId.current,
          chart,
          containerRef.current
        );
        
        // Update the container with the rendered SVG
        containerRef.current.innerHTML = svg;
        
        // Bind any interactive functions to the rendered diagram
        if (bindFunctions) {
          bindFunctions(containerRef.current);
        }
      } catch (error) {
        console.error("Mermaid render error:", error);
        
        // Show error message
        if (containerRef.current) {
          containerRef.current.innerHTML = `
            <div class="p-4 bg-red-100 border border-red-500 text-red-700 rounded">
              <p class="font-bold">Diagram Error</p>
              <pre class="text-sm whitespace-pre-wrap">${error.message || "Failed to render diagram"}</pre>
            </div>
          `;
        }
      }
    };
    
    // Render the diagram
    renderDiagram();
    
    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [chart]);
  
  return (
    <div className="mermaid-container bg-gray-50 rounded-lg shadow-inner p-4 my-6">
      <div ref={containerRef} className="relative">
        {/* Initial loading state */}
        <div className="flex items-center justify-center h-32 text-gray-400">
          <svg className="animate-spin h-6 w-6 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Rendering diagram...
        </div>
      </div>
    </div>
  );
}

MermaidDiagram.propTypes = {
  chart: PropTypes.string.isRequired
}; 