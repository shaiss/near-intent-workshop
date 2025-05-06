import React, { useState } from "react";
// import { Link } from "react-router-dom"; // No longer used here
// import { createPageUrl } from "@/utils"; // No longer used here
import {
  Menu,
//  X, // No longer used here
//  FileText, // No longer used here
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import WorkshopSidebar from "@/components/workshop/WorkshopSidebar";
import { Toaster } from "@/components/ui/toaster";
import { getWorkshopMetadata } from "../services/ContentService";
import PropTypes from "prop-types";

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [workshopTitle, setWorkshopTitle] = useState("NEAR INTENTS");

  React.useEffect(() => {
    getWorkshopMetadata().then(meta => {
      if (meta && meta.title) setWorkshopTitle(meta.title);
    });
  }, []);

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

      {/* Sidebar - Using WorkshopSidebar component */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-72 bg-white neo-sidebar transform transition-transform duration-200 ease-in-out md:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="h-full overflow-hidden">
          <WorkshopSidebar onNavigate={() => setSidebarOpen(false)} workshopTitle={workshopTitle} />
        </div>
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
            <h1 className="text-lg font-black">{workshopTitle} WORKSHOP</h1>
          </div>
        </header>

        {/* Main content area */}
        <main className="p-4 md:p-8">{children}</main>

        {/* Footer */}
        <footer className="mt-12 py-6 px-4 border-t-4 border-black bg-gray-100">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-center md:text-left">
              <p className="font-bold">
                NEAR Intents & Smart Wallet Abstraction Workshop
              </p>
              <p className="text-sm">
                Built by Shai Perednik - An interactive guide to the future of
                blockchain interactions
              </p>
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
      <Toaster />
    </div>
  );
}

Layout.propTypes = {
  children: PropTypes.node,
};
