// This file dynamically imports all markdown content
// In development, the ContentService will scan directories at runtime
// In production, this ensures all content is bundled with the app

// Dynamic import of all markdown files using Vite's import.meta.glob
// Using the recommended syntax for Vite
const contentImports = import.meta.glob('./**/*.md', { eager: true, query: '?raw', import: 'default' });

// Convert to simpler map for easier access
const contentMap = {};

// Process all imported files
Object.entries(contentImports).forEach(([path, content]) => {
  // Format: ./01-introduction/01-welcome.md -> 01-introduction/01-welcome.md
  const relativePath = path.replace(/^\.\//, '');
  contentMap[relativePath] = content;
});

export default contentMap;
