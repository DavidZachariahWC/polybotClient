//officialPolyBot/components/MarkdownRenderer/MarkdownRenderer.tsx

'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkEmoji from 'remark-emoji';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import type { SyntaxHighlighterProps } from 'react-syntax-highlighter';
import 'katex/dist/katex.min.css';
import './MarkdownRenderer.css';
import DOMPurify from 'dompurify';

// Import languages
import typescript from 'react-syntax-highlighter/dist/cjs/languages/prism/typescript';
import javascript from 'react-syntax-highlighter/dist/cjs/languages/prism/javascript';
import python from 'react-syntax-highlighter/dist/cjs/languages/prism/python';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import bash from 'react-syntax-highlighter/dist/cjs/languages/prism/bash';
import css from 'react-syntax-highlighter/dist/cjs/languages/prism/css';
import sql from 'react-syntax-highlighter/dist/cjs/languages/prism/sql';
import jsx from 'react-syntax-highlighter/dist/cjs/languages/prism/jsx';
import tsx from 'react-syntax-highlighter/dist/cjs/languages/prism/tsx';
import html from 'react-syntax-highlighter/dist/cjs/languages/prism/markup';
import yaml from 'react-syntax-highlighter/dist/cjs/languages/prism/yaml';

// Register languages
SyntaxHighlighter.registerLanguage('typescript', typescript);
SyntaxHighlighter.registerLanguage('javascript', javascript);
SyntaxHighlighter.registerLanguage('python', python);
SyntaxHighlighter.registerLanguage('json', json);
SyntaxHighlighter.registerLanguage('bash', bash);
SyntaxHighlighter.registerLanguage('css', css);
SyntaxHighlighter.registerLanguage('sql', sql);
SyntaxHighlighter.registerLanguage('jsx', jsx);
SyntaxHighlighter.registerLanguage('tsx', tsx);
SyntaxHighlighter.registerLanguage('html', html);
SyntaxHighlighter.registerLanguage('yaml', yaml);

interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
  [key: string]: any;  // Allow for additional props
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
      components={{
        code: ({ node, inline, className, children, ...props }: CodeProps) => {
          const match = /language-(\w+)/.exec(className || '');
          
          if (inline) {
            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }

          const language = match ? match[1] : '';
          
          if (language === 'json') {
            try {
              const jsonContent = JSON.stringify(JSON.parse(String(children)), null, 2);
              return (
                <SyntaxHighlighter
                  style={oneDark as any}
                  language="json"
                  PreTag="div"
                  {...props}
                >
                  {jsonContent}
                </SyntaxHighlighter>
              );
            } catch (e) {
              // If JSON parsing fails, render as is
            }
          }

          return (
            <div className="relative">
              {language && (
                <div className="absolute right-2 top-2 text-xs text-zinc-400 bg-zinc-800/50 px-2 py-1 rounded">
                  {language}
                </div>
              )}
              <SyntaxHighlighter
                style={oneDark as any}
                language={language || 'text'}
                PreTag="div"
                {...props}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            </div>
          );
        }
      }}
    >
      {sanitizeHtml(content)}
    </ReactMarkdown>
  );
};

export default MarkdownRenderer;