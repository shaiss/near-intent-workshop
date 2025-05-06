import contentMap from '../content/index.js';
import yaml from 'js-yaml'; // If not installed, run: npm install js-yaml

class ContentService {
  constructor() {
    this.contentCache = new Map();
    this.structureCache = null;
    this.lastFetchTime = new Map();
    // Cache expiry in milliseconds (5 minutes)
    this.cacheExpiry = 5 * 60 * 1000;
    // Detect if we're in production
    this.isProduction = import.meta.env.PROD;

    // Initialize structure on startup
    this.initializeStructure();
  }

  async initializeStructure() {
    try {
      console.log("ContentService: Initializing workshop structure on startup");
      await this.fetchWorkshopStructure();
    } catch (error) {
      console.error("Failed to initialize workshop structure:", error);
    }
  }

  async getWorkshopStructure() {
    // Always fetch fresh structure in development mode
    if (!this.isProduction) {
      return await this.fetchWorkshopStructure();
    }

    const now = Date.now();

    // Return cached structure if it exists and is fresh (only in production)
    if (this.structureCache && 
        this.lastFetchTime.get('structure') > now - this.cacheExpiry) {
      return this.structureCache;
    }

    return await this.fetchWorkshopStructure();
  }

  async fetchWorkshopStructure() {
    try {
      console.log("ContentService: Building workshop structure from folder structure");

      // Initialize structure object
      const structure = {
        title: "NEAR Intents & Smart Wallet Abstraction Workshop",
        description: "A hands-on workshop for building next-generation dApps with NEAR's intent-centric architecture",
        parts: []
      };

      // For production, generate the structure from the contentMap
      if (this.isProduction) {
        console.log("Building structure from bundled files in production mode");
        
        // Create a mapping of folders to files
        const folderFiles = {};
        
        // Collect all markdown files by folder
        Object.keys(contentMap).forEach(path => {
          if (path.endsWith('.md')) {
            const [folder, file] = path.split('/', 2);
            
            if (!folderFiles[folder]) {
              folderFiles[folder] = [];
            }
            
            folderFiles[folder].push(file);
          }
        });
        
        // Process each folder in order
        Object.keys(folderFiles)
          .sort()
          .forEach(folder => {
            // Only process numbered folders (e.g., 01-introduction)
            if (!/^\d{2}-[a-z-]+$/.test(folder)) {
              return;
            }
            
            // Extract module number and title
            const [, moduleNum, moduleTitle] = folder.match(/^(\d{2})-(.+)$/);
            
            // Create a part object
            const part = {
              id: parseInt(moduleNum),
              title: moduleTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              sections: []
            };
            
            // Sort files and process each one
            folderFiles[folder]
              .sort()
              .forEach(file => {
                // Only process numbered markdown files
                if (!/^\d{2}-[a-z-]+\.md$/.test(file)) {
                  return;
                }
                
                // Extract section number and title
                const [, sectionNum, sectionTitle] = file.match(/^(\d{2})-(.+)\.md$/);
                
                // Extract a better title from the content if possible
                let fileTitle = sectionTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                
                const content = contentMap[`${folder}/${file}`];
                if (content) {
                  const titleMatch = content.match(/^#\s+(.*)/m);
                  if (titleMatch) {
                    fileTitle = titleMatch[1].trim();
                  }
                }
                
                // Add the section
                part.sections.push({
                  id: parseInt(sectionNum),
                  title: fileTitle,
                  slug: `${folder}/${file.replace(/\.md$/, '')}`
                });
              });
            
            // Only add parts with sections
            if (part.sections.length > 0) {
              structure.parts.push(part);
            }
          });
      } else {
        // For development, scan directory structure
        try {
          // Fetch the root directory structure to get the module folders
          const rootResponse = await fetch('/src/content?t=' + Date.now());
          if (!rootResponse.ok) {
            console.error(`Failed to fetch content directory: ${rootResponse.status}`);
            throw new Error('Failed to fetch content directory');
          }
          
          const rootDir = await rootResponse.json();
          
          // Filter and sort folders (only include numbered folders like 01-introduction, etc.)
          const moduleFolders = rootDir.folders
            .filter(folder => /^\d{2}-[a-z-]+$/.test(folder))
            .sort();
          
          // Process each module folder to build parts
          for (const moduleFolder of moduleFolders) {
            // Extract module number and title from folder name (e.g., "01-introduction")
            const [, moduleNum, moduleTitle] = moduleFolder.match(/^(\d{2})-(.+)$/);
            
            // Create a part object for this module
            const part = {
              id: parseInt(moduleNum),
              title: moduleTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
              sections: []
            };
            
            // Fetch the module directory to get markdown files
            const moduleResponse = await fetch(`/src/content/${moduleFolder}?t=${Date.now()}`);
            if (!moduleResponse.ok) {
              console.warn(`Skipping module ${moduleFolder}: ${moduleResponse.status}`);
              continue;
            }
            
            const moduleDir = await moduleResponse.json();
            
            // Filter and sort markdown files
            const markdownFiles = moduleDir.files
              .filter(file => file.endsWith('.md'))
              .sort();
            
            // Process each markdown file to build sections
            for (const mdFile of markdownFiles) {
              // Extract section number and title from file name (e.g., "01-welcome.md")
              const [, sectionNum, sectionTitle] = mdFile.match(/^(\d{2})-(.+)\.md$/);
              
              // Read the first line of the markdown file to get the section title
              let fileTitle = sectionTitle.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
              
              try {
                const fileResponse = await fetch(`/src/content/${moduleFolder}/${mdFile}?t=${Date.now()}`);
                if (fileResponse.ok) {
                  const content = await fileResponse.text();
                  const titleMatch = content.match(/^#\s+(.*)/);
                  if (titleMatch) {
                    fileTitle = titleMatch[1].trim();
                  }
                }
              } catch (error) {
                console.warn(`Could not read title from ${mdFile}:`, error);
              }
              
              // Add the section to the part
              part.sections.push({
                id: parseInt(sectionNum),
                title: fileTitle,
                slug: `${moduleFolder}/${sectionNum}-${sectionTitle}`
              });
            }
            
            // Add the part to the structure
            structure.parts.push(part);
          }
          
          // Sort parts by ID
          structure.parts.sort((a, b) => a.id - b.id);
        } catch (error) {
          console.error("Error scanning directory structure:", error);
          throw error;
        }
      }
      
      // If no parts were found, this is a problem
      if (structure.parts.length === 0) {
        console.error("No modules found in content directory");
        throw new Error("No modules found in content directory");
      }
      
      // Update cache
      this.structureCache = structure;
      this.lastFetchTime.set('structure', Date.now());
      
      return structure;
    } catch (error) {
      console.error('Error loading workshop structure:', error);
      throw error;
    }
  }

  async getContent(fileName) {
    // Always fetch fresh content in development mode
    if (!this.isProduction) {
      return await this.fetchContent(fileName);
    }

    const now = Date.now();

    // Return cached content if it exists and is fresh (only in production)
    if (this.contentCache.has(fileName) && 
        this.lastFetchTime.get(fileName) > now - this.cacheExpiry) {
      return this.contentCache.get(fileName);
    }

    return await this.fetchContent(fileName);
  }

  async fetchContent(fileName) {
    try {
      let text;

      if (this.isProduction) {
        // In production, use the preloaded content
        text = contentMap[fileName];
        if (!text) {
          console.error(`Content file ${fileName} not found in contentMap`);
          throw new Error(`Content file ${fileName} not found`);
        }
      } else {
        try {
          // First try contentMap for faster loading (if available)
          text = contentMap[fileName];
          
          if (!text) {
            console.log(`Content file ${fileName} not in contentMap, fetching from filesystem`);
            
            // Require a folder structure in the path for markdown content
            if (!fileName.includes('/')) {
              throw new Error(`Invalid content path: ${fileName} - must use folder structure (e.g., "01-introduction/01-welcome")`);
            }
            
            // Try with the direct path
            let response = await fetch(`/src/content/${fileName}?t=${Date.now()}`);
            
            // Try adding .md extension if needed
            if (!response.ok && !fileName.endsWith('.md')) {
              console.log(`Trying with .md extension: /src/content/${fileName}.md`);
              response = await fetch(`/src/content/${fileName}.md?t=${Date.now()}`);
            }
            
            if (!response.ok) {
              throw new Error(`Failed to fetch content: ${response.status}`);
            }
            
            text = await response.text();
          }
        } catch (fetchError) {
          console.error(`Error fetching ${fileName} from filesystem:`, fetchError);
          throw fetchError;
        }
      }

      // Update cache
      this.contentCache.set(fileName, text);
      this.lastFetchTime.set(fileName, Date.now());

      return text;
    } catch (error) {
      console.error(`Error loading content file ${fileName}:`, error);
      throw error;
    }
  }

  // Force refresh content
  async refreshContent(fileName) {
    // Clear cache for the specific file
    this.contentCache.delete(fileName);
    this.lastFetchTime.delete(fileName);

    // Fetch fresh content
    return await this.fetchContent(fileName);
  }

  // Force refresh all content
  async refreshAllContent() {
    console.log("Refreshing all content...");
    this.contentCache.clear();
    this.lastFetchTime.clear();
    this.structureCache = null;

    try {
      // Fetch fresh structure with no caching
      const freshStructure = await this.fetchWorkshopStructure();
      console.log("Fresh structure loaded:", JSON.stringify(freshStructure, null, 2));
      return freshStructure;
    } catch (error) {
      console.error("Error refreshing content:", error);
      throw error;
    }
  }

  async exportWorkshopContent() {
    try {
      const structure = await this.getWorkshopStructure();
      let markdownContent = `# ${structure.title}\n\n${structure.description}\n\n`;

      // Loop through each part and section to build the complete markdown
      for (const part of structure.parts) {
        markdownContent += `\n## Part ${part.id}: ${part.title}\n\n`;

        for (const section of part.sections) {
          markdownContent += `### ${part.id}.${section.id} ${section.title}\n\n`;

          // If the section has a slug, get its content
          if (section.slug) {
            try {
              const sectionContent = await this.getContent(section.slug + '.md');
              if (sectionContent) {
                // Remove the first heading (title) as we already added it
                const contentWithoutTitle = sectionContent.replace(/^#.*?\n/, '');
                markdownContent += contentWithoutTitle + '\n\n';
              } else {
                markdownContent += '*Content not available*\n\n';
              }
            } catch {
              markdownContent += '*Error loading content*\n\n';
            }
          } else {
            markdownContent += '*Coming soon*\n\n';
          }
        }
      }

      return markdownContent;
    } catch (error) {
      console.error("Failed to export workshop content:", error);
      throw error;
    }
  }
}

let workshopMetadataCache = null;
let lastMetadataFetch = 0;
const METADATA_CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

export async function getWorkshopMetadata() {
  const now = Date.now();
  const isProduction = import.meta.env.PROD;
  
  // Skip cache in development mode, always fetch fresh data
  if (!isProduction) {
    return await fetchWorkshopMetadata();
  }
  
  // Return cached metadata in production if it exists and is fresh
  if (workshopMetadataCache && (now - lastMetadataFetch < METADATA_CACHE_EXPIRY)) {
    return workshopMetadataCache;
  }
  
  return await fetchWorkshopMetadata();
}

// Separate the fetching logic for better organization
async function fetchWorkshopMetadata() {
  try {
    // Add timestamp to prevent browser caching
    const now = Date.now();
    const yamlText = await fetch(`/src/content/workshop.yaml?t=${now}`).then(r => r.text());
    const metadata = yaml.load(yamlText);
    
    // Update cache
    workshopMetadataCache = metadata;
    lastMetadataFetch = Date.now();
    
    return metadata;
  } catch (error) {
    console.error("Error fetching workshop metadata:", error);
    return null;
  }
}

export function getSectionsFromMarkdown(markdownContent) {
  const sections = {};
  if (!markdownContent) return sections;

  const lines = markdownContent.split('\n');
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Assuming H2 (##) for main section titles in home.md
    const sectionMatch = line.match(/^##\s+(.*)/);
    if (sectionMatch) {
      if (currentSection) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      currentSection = sectionMatch[1].trim();
      currentContent = [];
    } else if (currentSection) {
      currentContent.push(line);
    }
  }

  if (currentSection) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

export default new ContentService();