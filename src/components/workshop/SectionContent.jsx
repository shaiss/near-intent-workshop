import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { Copy, Check } from "lucide-react";

export default function SectionContent({ content, loading }) {
  const [copied, setCopied] = React.useState({});

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopied({...copied, [id]: true});
    setTimeout(() => {
      setCopied({...copied, [id]: false});
    }, 2000);
  };

  // Custom renderer for code blocks with copy button
  const CodeBlock = ({node, inline, className, children, ...props}) => {
    const match = /language-(\w+)/.exec(className || '');
    const id = Math.random().toString(36).substring(7);
    
    return !inline ? (
      <div className="relative mt-4 mb-6">
        <div className="absolute right-2 top-2">
          <button
            onClick={() => handleCopy(id, String(children).replace(/\n$/, ''))}
            className="p-1 bg-black bg-opacity-30 rounded text-white hover:bg-opacity-50 transition-all"
            aria-label="Copy code"
          >
            {copied[id] ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
        <pre className="p-4 bg-gray-900 text-gray-100 rounded-lg overflow-x-auto neo-brutalism">
          <code className={className} {...props}>
            {children}
          </code>
        </pre>
        {match && (
          <div className="text-xs text-right mt-1 text-gray-500">
            {match[1]}
          </div>
        )}
      </div>
    ) : (
      <code className="bg-gray-200 px-1 py-0.5 rounded text-sm" {...props}>
        {children}
      </code>
    );
  };

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

  return (
    <div className="prose prose-lg max-w-none">
      <ReactMarkdown
        components={{
          code: CodeBlock,
          a: ({node, ...props}) => (
            <a 
              {...props} 
              className="text-blue-600 font-semibold underline flex items-center" 
              target="_blank" 
              rel="noopener noreferrer"
            />
          ),
          h1: ({node, ...props}) => (
            <h1 {...props} className="text-4xl font-black mb-6" />
          ),
          h2: ({node, ...props}) => (
            <h2 {...props} className="text-2xl font-bold mt-8 mb-4" />
          ),
          h3: ({node, ...props}) => (
            <h3 {...props} className="text-xl font-bold mt-6 mb-3" />
          )
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}