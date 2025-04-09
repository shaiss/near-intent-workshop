
import { marked } from 'marked';
import contentMap from '../content/index.js';

class ContentService {
  constructor() {
    this.contentCache = new Map();
    this.structureCache = null;
    this.lastFetchTime = new Map();
    // Cache expiry in milliseconds (5 minutes)
    this.cacheExpiry = 5 * 60 * 1000;
    // Detect if we're in production
    this.isProduction = import.meta.env.PROD;
  }

  async getWorkshopStructure() {
    const now = Date.now();
    
    // Return cached structure if it exists and is fresh
    if (this.structureCache && this.lastFetchTime.get('structure') > now - this.cacheExpiry) {
      return this.structureCache;
    }
    
    // Get the workshop structure markdown
    try {
      let text;
      
      if (this.isProduction) {
        // In production, use the preloaded content
        text = contentMap['workshop-structure.md'];
      } else {
        // In development, fetch from file system
        const response = await fetch('/src/content/workshop-structure.md');
        text = await response.text();
      }
      
      const structure = this.parseWorkshopStructure(text);
      
      // Update cache
      this.structureCache = structure;
      this.lastFetchTime.set('structure', now);
      
      return structure;
    } catch (error) {
      console.error('Error loading workshop structure:', error);
      throw error;
    }
  }

  async getContent(fileName) {
    const now = Date.now();
    
    // Return cached content if it exists and is fresh
    if (this.contentCache.has(fileName) && 
        this.lastFetchTime.get(fileName) > now - this.cacheExpiry) {
      return this.contentCache.get(fileName);
    }
    
    // Get the content markdown
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
        // In development, fetch from file system
        const response = await fetch(`/src/content/${fileName}`);
        text = await response.text();
      }
      
      // Update cache
      this.contentCache.set(fileName, text);
      this.lastFetchTime.set(fileName, now);
      
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
    return await this.getContent(fileName);
  }

  // Force refresh all content
  async refreshAllContent() {
    this.contentCache.clear();
    this.lastFetchTime.clear();
    this.structureCache = null;
    
    // Fetch fresh structure
    return await this.getWorkshopStructure();
  }

  // Parse the workshop structure markdown into a structured object
  parseWorkshopStructure(markdown) {
    const lines = markdown.split('\n');
    const structure = {
      title: '',
      description: '',
      parts: []
    };
    
    let currentPart = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Parse workshop title (H1)
      if (line.startsWith('# ')) {
        structure.title = line.substring(2).trim();
      } 
      // Parse description (text after title and before first H2)
      else if (structure.title && !structure.description && !line.startsWith('## ') && line) {
        structure.description = line;
      }
      // Parse part title (H2)
      else if (line.startsWith('## ')) {
        currentPart = {
          id: structure.parts.length,
          title: line.substring(3).trim(),
          sections: []
        };
        structure.parts.push(currentPart);
      }
      // Parse section (list item with link)
      else if (currentPart && line.startsWith('- [')) {
        const titleMatch = line.match(/- \[(.*?)\]\((.*?)\)/);
        if (titleMatch) {
          const title = titleMatch[1];
          const slug = titleMatch[2].replace('.md', '');
          currentPart.sections.push({
            id: currentPart.sections.length + 1,
            title,
            slug
          });
        }
      }
    }
    
    return structure;
  }
}

export default new ContentService();
