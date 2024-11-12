//officialPolyBot/components/MarkdownRenderer/MarkdownRenderer.tsx

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import 'katex/dist/katex.min.css';
import DOMPurify from 'dompurify';

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

interface MarkdownRendererProps {
  content: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const sanitizeHtml = (html: string): string => {
    if (typeof window !== 'undefined') {
      return DOMPurify.sanitize(html, {
        USE_PROFILES: { html: true },
        ADD_ATTR: ['target', 'rel'],
        ALLOWED_TAGS: [
          'a', 'abbr', 'acronym', 'b', 'blockquote', 'code', 'em', 'i', 'li', 'ol',
          'strong', 'ul', 'h1', 'h2', 'h3', 'pre', 'img', 'table', 'thead', 'tbody',
          'th', 'td', 'tr', 'p', 'span', 'div', 'hr'
        ],
        ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id', 'target', 'rel']
      });
    }
    return html;
  };

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkEmoji, remarkMath]}
      rehypePlugins={[rehypeKatex, rehypeRaw]}
      className="prose prose-invert max-w-none"
      components={{
        code: ({ inline, className, children }: CodeProps) => {
          const match = /language-(\w+)/.exec(className || '');
          
          if (inline) {
            return (
              <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-200 text-sm">
                {children}
              </code>
            );
          }

          return (
            <div className="relative my-4">
              {match && (
                <div className="absolute right-2 top-2 text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                  {match[1]}
                </div>
              )}
              <SyntaxHighlighter
                style={oneDark}
                language={match?.[1] || 'text'}
                PreTag="div"
                customStyle={{
                  margin: 0,
                  borderRadius: '0.5rem',
                  background: 'rgb(39 39 42)',
                }}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          );
        },
        p: ({ children }) => (
          <p className="mb-4 last:mb-0 text-zinc-200">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc pl-4 mb-4 text-zinc-200">{children}</ul>
        ),
        ol: ({ children }) => (
          <ol className="list-decimal pl-4 mb-4 text-zinc-200">{children}</ol>
        ),
        li: ({ children }) => (
          <li className="mb-1 text-zinc-200">{children}</li>
        ),
        blockquote: ({ children }) => (
          <blockquote className="border-l-4 border-zinc-700 pl-4 italic my-4 text-zinc-300">
            {children}
          </blockquote>
        ),
        a: ({ children, href }) => (
          <a 
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            {children}
          </a>
        ),
        table: ({ children }) => (
          <div className="overflow-x-auto my-4">
            <table className="min-w-full divide-y divide-zinc-700">
              {children}
            </table>
          </div>
        ),
        th: ({ children }) => (
          <th className="px-4 py-2 bg-zinc-800 text-left font-semibold text-zinc-200">
            {children}
          </th>
        ),
        td: ({ children }) => (
          <td className="px-4 py-2 border-t border-zinc-700 text-zinc-200">
            {children}
          </td>
        ),
      }}
    >
      {sanitizeHtml(content)}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer; 