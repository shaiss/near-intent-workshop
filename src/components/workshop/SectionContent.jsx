import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from "@/components/ui/skeleton";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

export default function SectionContent({ content, loading }) {
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