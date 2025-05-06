import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { 
  ArrowRight, 
  FileCode, 
  Wallet, 
  Code, 
  Settings, 
  Share2,
  ChevronDown
} from "lucide-react";
import { getWorkshopMetadata } from "@/services/ContentService";

// Map of icon names to icon components
const iconMap = {
  Wallet: Wallet,
  Code: Code,
  Settings: Settings,
  Share2: Share2
};

// Map color names from YAML to Tailwind classes
// This ensures Tailwind can see all class names at build time
const getColorClass = (color) => {
  const colorMap = {
    // Basic colors
    pink: "bg-pink-200",
    green: "bg-green-200",
    orange: "bg-orange-200",
    blue: "bg-blue-200",
    red: "bg-red-200",
    purple: "bg-purple-200",
    yellow: "bg-yellow-200",
    cyan: "bg-cyan-200",
    gray: "bg-gray-100",
    
    // Colors with intensities
    "pink-100": "bg-pink-100",
    "pink-200": "bg-pink-200",
    "pink-300": "bg-pink-300",
    "green-100": "bg-green-100",
    "green-200": "bg-green-200",
    "green-300": "bg-green-300",
    "blue-100": "bg-blue-100",
    "blue-200": "bg-blue-200",
    "blue-300": "bg-blue-300",
    "orange-100": "bg-orange-100",
    "orange-200": "bg-orange-200",
    "orange-300": "bg-orange-300",
    "yellow-100": "bg-yellow-100",
    "yellow-200": "bg-yellow-200",
    "yellow-300": "bg-yellow-300",
    // Add more as needed
  };
  
  // Return the color class or a default if color isn't found
  return colorMap[color] || "bg-gray-100";
};

// Button styling helper for Button components
const getButtonClasses = (bgColor, textColor, additionalClasses = "") => {
  const bgClasses = {
    black: "bg-black",
    white: "bg-white",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    // Add more as needed
  };
  
  const textClasses = {
    black: "text-black",
    white: "text-white",
    // Add more as needed
  };
  
  return `${bgClasses[bgColor] || "bg-black"} ${textClasses[textColor] || "text-white"} neo-button text-lg px-6 py-3 font-bold ${additionalClasses}`;
};

// Helper function for styled anchor links (like the GitHub button)
const getAnchorButtonClasses = (bgColor, textColor, additionalClasses = "") => {
  const bgClasses = {
    black: "bg-black",
    white: "bg-white",
    blue: "bg-blue-500",
    green: "bg-green-500",
    red: "bg-red-500",
    // Add more as needed
  };
  
  const textClasses = {
    black: "text-black",
    white: "text-white",
    // Add more as needed
  };
  
  return `${bgClasses[bgColor] || "bg-white"} ${textClasses[textColor] || "text-black"} neo-button text-lg px-6 py-3 font-bold ${additionalClasses}`;
};

export default function Home() {
  const [metadata, setMetadata] = useState({
    // Default values
    title: "NEAR Intents & Smart Wallet Abstraction",
    description: "A hands-on workshop for building next-generation dApps with NEAR's intent-centric architecture",
    call_to_action: { text: "Start Workshop", target: "01-introduction/01-welcome", link_type: "internal" },
    what_you_will_learn: [],
    prerequisites: [],
    workshop_structure: [],
    key_features: [],
    faqs: [],
    get_started: {
      heading: "Ready to Begin?",
      description: "Start your journey with NEAR Intents and revolutionize your dApp development approach",
      secondary_button: { text: "Quick Overview", link: "Section?slug=01-introduction/02-overview" }
    }
  });
  
  // Function to load the workshop metadata
  const loadWorkshopMetadata = React.useCallback(async () => {
    try {
      const data = await getWorkshopMetadata();
      if (data) setMetadata(prev => ({ ...prev, ...data }));
    } catch (error) {
      console.error("Error fetching workshop metadata:", error);
    }
  }, []);
  
  useEffect(() => {
    // Initial load of workshop metadata
    loadWorkshopMetadata();
    
    // Development mode only: Setup refresh on window focus or visibility change
    if (import.meta.env.DEV) {
      // When user switches back to this tab, refresh the data
      const handleFocus = () => {
        console.log("Window focused, refreshing workshop metadata");
        loadWorkshopMetadata();
      };
      
      // Also listen for visibility change which works better in some browsers
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          console.log("Tab became visible, refreshing workshop metadata");
          loadWorkshopMetadata();
        }
      };
      
      window.addEventListener('focus', handleFocus);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      // Clean up event listeners when component unmounts
      return () => {
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [loadWorkshopMetadata]);

  // Helper to create the CTA link
  const ctaLink = metadata.call_to_action.link_type === "internal" 
    ? createPageUrl(`Section?slug=${metadata.call_to_action.target}`)
    : metadata.call_to_action.target;

  // Helper function to get icon component by name
  const getIconComponent = (iconName) => {
    const IconComponent = iconMap[iconName];
    return IconComponent ? <IconComponent className="mx-auto h-12 w-12 mb-4" /> : null;
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section - Using dynamic content from workshop.yaml */}
      <div className="p-8 md:p-12 mb-12 bg-yellow-300 neo-brutalism relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-black mb-4" dangerouslySetInnerHTML={{ 
            __html: metadata.title.replace(/\n/g, '<br />').replace(/'/g, "&#39;") 
          }}></h1>
          <p className="text-xl md:text-2xl font-bold mb-8 max-w-3xl">
            {typeof metadata.description === 'string' ? metadata.description.replace(/'/g, "&#39;") : ''}
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to={ctaLink}>
              <Button className={getButtonClasses(
                metadata.ui_settings?.primary_button_bg || 'black',
                metadata.ui_settings?.primary_button_text || 'white',
                'px-8 py-6'
              )}>
                {metadata.call_to_action.text} <ArrowRight className="ml-2" />
              </Button>
            </Link>
            <a 
              href={metadata.github_repo || "https://github.com/shaiss/near-intent-workshop"} 
              target="_blank" 
              rel="noopener noreferrer"
              className={getAnchorButtonClasses(
                metadata.ui_settings?.secondary_button_bg || 'white',
                metadata.ui_settings?.secondary_button_text || 'black',
                'px-8 py-6 flex items-center'
              )}
            >
              View on GitHub <FileCode className="ml-2" />
            </a>
          </div>
        </div>
        
        {/* Abstract graphic elements */}
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-orange-400 rounded-full opacity-30"></div>
        <div className="absolute bottom-10 right-24 w-40 h-40 bg-blue-500 rounded-full opacity-30"></div>
      </div>

      {/* Workshop Overview */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Workshop Overview</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="p-6 bg-cyan-200 neo-brutalism">
            <h3 className="text-xl font-bold mb-4">What You&apos;ll Learn</h3>
            <ul className="space-y-3">
              {metadata.what_you_will_learn && metadata.what_you_will_learn.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="p-6 bg-purple-200 neo-brutalism">
            <h3 className="text-xl font-bold mb-4">Prerequisites</h3>
            <ul className="space-y-3">
              {metadata.prerequisites && metadata.prerequisites.map((item, index) => (
                <li key={index} className="flex items-start gap-2">
                  <div className="mt-1 w-4 h-4 bg-black rounded-full flex-shrink-0"></div>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Workshop Structure */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Workshop Structure</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {metadata.workshop_structure && metadata.workshop_structure.map((section, index) => (
            <div key={index} className={`p-6 ${getColorClass(section.bg_color)} neo-brutalism flex flex-col`}>
              <div className="mb-4 w-12 h-12 bg-black rounded-full flex items-center justify-center text-white font-bold text-xl">
                {section.number}
              </div>
              <h3 className="text-xl font-bold mb-2">{section.title}</h3>
              <p className="flex-grow mb-4">{section.description}</p>
              <Link to={createPageUrl(section.link)}>
                <Button className={getButtonClasses(
                  'white',
                  'black',
                  'w-full'
                )}>
                  {section.link_text}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Key Features */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Key Features</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {metadata.key_features && metadata.key_features.map((feature, index) => (
            <div key={index} className={`p-6 ${getColorClass(feature.bg_color)} neo-brutalism text-center`}>
              {getIconComponent(feature.icon)}
              <h3 className="font-bold mb-2">{feature.title}</h3>
              <p className="text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Get Started Section - Using dynamic CTA from workshop.yaml */}
      <div className={`p-8 ${getColorClass(metadata.get_started?.bg_color || 'blue')} neo-brutalism mb-12`}>
        <h2 className="text-3xl font-black mb-4">{metadata.get_started?.heading || "Ready to Begin?"}</h2>
        <p className="text-xl mb-6">{metadata.get_started?.description || "Start your journey with NEAR Intents and revolutionize your dApp development approach"}</p>
        <div className="flex flex-wrap gap-4">
          <Link to={ctaLink}>
            <Button className={getButtonClasses(
              metadata.ui_settings?.primary_button_bg || 'black',
              metadata.ui_settings?.primary_button_text || 'white'
            )}>
              {metadata.call_to_action.text}
            </Button>
          </Link>
          {metadata.get_started?.secondary_button && (
            <Link to={createPageUrl(metadata.get_started.secondary_button.link)}>
              <Button className={getButtonClasses(
                metadata.ui_settings?.secondary_button_bg || 'white',
                metadata.ui_settings?.secondary_button_text || 'black'
              )}>
                {metadata.get_started.secondary_button.text}
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-12">
        <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {metadata.faqs && metadata.faqs.map((faq, index) => (
            <div key={index} className={`p-6 ${getColorClass(metadata.faq_settings?.bg_color || 'gray')} neo-brutalism`}>
              <h3 className="text-xl font-bold flex items-center justify-between cursor-pointer">
                <span>{faq.question}</span>
                {metadata.faq_settings?.has_expandable !== false && (
                  <ChevronDown className="w-6 h-6" />
                )}
              </h3>
              <p className="mt-4">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
