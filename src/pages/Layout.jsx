import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Menu, X, FileText, ChevronDown, ChevronUp, Home, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
// Import the function to parse the markdown file
import ContentService from '@/services/ContentService';


export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedParts, setExpandedParts] = useState({});
  const [workshopStructure, setWorkshopStructure] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const fetchWorkshopStructure = async () => {
      try {
        const structure = await ContentService.getWorkshopStructure();
        setWorkshopStructure(structure);
      } catch (error) {
        console.error("Error fetching workshop structure:", error);
        // Handle error appropriately, maybe display an error message
      } finally {
        setLoading(false);
      }
    };
    fetchWorkshopStructure();
  }, []);

  const togglePart = (part) => {
    setExpandedParts(prev => ({
      ...prev,
      [part]: !prev[part]
    }));
  };


  // Show loading state while structure is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // Handle case where workshopStructure is still null after loading
  if (!workshopStructure) {
    return <div>Error loading workshop structure</div>;
  }

  const sections = workshopStructure.parts.flatMap(part =>
    part.sections.map(section => ({
      part: part.id,
      sub: section.id,
      title: section.title,
      slug: section.slug
    }))
  );

  const partTitles = workshopStructure.parts.reduce((acc, part) => {
    acc[part.id] = part.title;
    return acc;
  }, {});


  return (
    <div className="min-h-screen bg-amber-50">
      {/* Neo-brutalism styling */}
      <style>
        {`
          :root {
            --primary: #ff3b30;
            --secondary: #3870ff;
            --border-width: 4px;
            --shadow-offset: 6px;
          }

          body {
            font-family: 'Inter', 'Helvetica Neue', sans-serif;
          }

          .neo-brutalism {
            border: var(--border-width) solid black;
            box-shadow: var(--shadow-offset) var(--shadow-offset) 0 0 #000;
            transition: all 0.2s ease;
          }

          .neo-brutalism:hover {
            transform: translate(-2px, -2px);
            box-shadow: calc(var(--shadow-offset) + 2px) calc(var(--shadow-offset) + 2px) 0 0 #000;
          }

          .neo-button {
            border: 3px solid black;
            box-shadow: 4px 4px 0 0 #000;
            transition: all 0.1s ease;
            transform: translate(0, 0);
            color: black;
          }

          .neo-button.bg-black {
            color: white;
          }

          .neo-button:hover {
            transform: translate(-2px, -2px);
            box-shadow: 6px 6px 0 0 #000;
          }

          .neo-button:active {
            transform: translate(2px, 2px);
            box-shadow: 2px 2px 0 0 #000;
          }

          .neo-nav-item {
            border-bottom: 3px solid transparent;
            transition: all 0.2s ease;
          }

          .neo-nav-item:hover, .neo-nav-item.active {
            border-bottom: 3px solid black;
            background-color: rgba(0,0,0,0.05);
          }

          .neo-sidebar {
            border-right: var(--border-width) solid black;
            box-shadow: var(--shadow-offset) 0 0 0 #000;
          }
        `}
      </style>

      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed top-0 left-0 z-50 h-full w-72 bg-white neo-sidebar transform transition-transform duration-200 ease-in-out md:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 bg-yellow-300 border-b-4 border-black">
          <Link
            to={createPageUrl("Home")}
            className="text-xl font-black flex items-center gap-2"
            onClick={() => setSidebarOpen(false)}
          >
            <FileText className="w-6 h-6" />
            <span>NEAR INTENTS</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        <nav className="px-2 py-4 overflow-y-auto h-[calc(100vh-64px)]">
          {/* Navigation for parts */}
          {Object.entries(partTitles).map(([part, title]) => (
            <div key={part} className="mb-2">
              <div
                className="flex items-center justify-between p-2 font-bold cursor-pointer neo-nav-item rounded-md"
                onClick={() => togglePart(part)}
              >
                <span>{title}</span>
                {expandedParts[part] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>

              {expandedParts[part] && (
                <div className="ml-4 mt-1 space-y-1">
                  {sections
                    .filter(section => section.part.toString() === part.toString())
                    .map(section => (
                      <Link
                        key={section.slug}
                        to={createPageUrl(`Section?slug=${section.slug}`)}
                        className={cn(
                          "block py-2 px-3 rounded-md neo-nav-item text-sm transition-colors",
                          location.pathname.includes(section.slug) ? "bg-black text-white font-bold" : ""
                        )}
                        onClick={() => setSidebarOpen(false)}
                      >
                        {section.part !== "appendix" ? `${section.part}.${section.sub}` : `A.${section.sub}`} {section.title}
                      </Link>
                    ))
                  }
                </div>
              )}
            </div>
          ))}
          <Button className="mt-4 w-full" onClick={() => window.location.reload()}>
            <RefreshCw className="h-4 w-4 mr-2"/> Reload Content
          </Button>
        </nav>
      </aside>

      {/* Main content */}
      <div className="md:ml-72">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 md:hidden bg-yellow-300 border-b-4 border-black p-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <h1 className="text-lg font-black">NEAR INTENTS WORKSHOP</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 md:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="mt-12 py-6 px-4 border-t-4 border-black bg-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold">NEAR Intents & Smart Wallet Abstraction Workshop</p>
              <p className="text-sm">Built by Shai Perednik - An interactive guide to the future of blockchain interactions</p>
            </div>
            <div className="flex gap-4">
              <a
                href="https://near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 px-3 bg-black text-white neo-button font-bold text-sm"
              >
                NEAR.org
              </a>
              <a
                href="https://docs.near.org"
                target="_blank"
                rel="noopener noreferrer"
                className="py-1 px-3 bg-yellow-300 neo-button font-bold text-sm"
              >
                NEAR Docs
              </a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}