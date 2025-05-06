import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import MermaidDiagram from './MermaidDiagram';
import rehypeRaw from 'rehype-raw';

export default function SectionContent({ content, loading, sectionTitle }) {
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-3/4" />
        <Skeleton className="h-6 w-1/2" />
        <div className="space-y-2 mt-8">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  const CodeBlock = ({ node, inline, className, children, ...props }) => {
    const match = /language-(\w+)/.exec(className || '');
    
    // Detect mermaid code blocks
    if (!inline && match && match[1] === 'mermaid') {
      return <MermaidDiagram chart={String(children).replace(/\n$/, '')} />;
    }
    
    // Regular code blocks
    return !inline && match ? (
      <SyntaxHighlighter
        style={atomDark}
        language={match[1]}
        PreTag="div"
        {...props}
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    ) : (
      <code className={className} {...props}>
        {children}
      </code>
    );
  };

  // Track if we've seen the first h1 that matches the section title
  let foundFirstH1 = false;

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          a: ({node, ...props}) => {
            // Check if it's a button link (contains class with 'button')
            const isButton = props.className && props.className.includes('button');
            return (
              <a 
                {...props} 
                className={isButton 
                  ? "inline-flex items-center bg-white text-black neo-button px-4 py-2 font-bold" 
                  : "text-blue-600 font-semibold underline flex items-center"
                }
                target="_blank" 
                rel="noopener noreferrer"
              />
            );
          },
          h1: ({node, children, ...props}) => {
            // Convert both to lowercase and trim for case-insensitive matching
            const headingText = children.toString().toLowerCase().trim();
            const title = sectionTitle ? sectionTitle.toLowerCase().trim() : '';
            
            // Check if this is the first h1 that matches the section title
            if (!foundFirstH1 && headingText === title) {
              foundFirstH1 = true;
              // Skip rendering this h1
              return null;
            }
            
            // Render other h1 elements normally
            return <h1 {...props} className="text-4xl font-black mb-6">{children}</h1>;
          },
          h2: ({node, ...props}) => (
            <h2 {...props} className="text-2xl font-bold mt-8 mb-4" />
          ),
          h3: ({node, ...props}) => (
            <h3 {...props} className="text-xl font-bold mt-6 mb-3" />
          )
        }}
        // Add rehype-raw plugin to enable HTML in markdown
        rehypePlugins={[rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}