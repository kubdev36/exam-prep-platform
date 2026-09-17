'use client';

import React, { useMemo } from 'react';
import katex from 'katex';

interface MathRendererProps {
  content: string;
  className?: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content, className = '' }) => {
  const renderedHtml = useMemo(() => {
    if (!content) return '';

    // Convert markdown images ![alt](url) to HTML <img>
    let text = content.replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="my-3 rounded-xl max-h-96 max-w-full mx-auto border border-white/10 shadow-lg" />');

    // Delimiters regex:
    // 1. $$ ... $$ (display)
    // 2. \[ ... \] (display)
    // 3. \( ... \) (inline)
    // 4. $ ... $ (inline)
    const regex = /(\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$[^$\n]+?\$)/g;
    const parts = text.split(regex);

    return parts
      .map((part) => {
        if (!part) return '';

        const cleanMath = (raw: string) =>
          raw
            .replace(/[\u00a0\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .trim();

        // Display mode math: $$...$$ or \[...\]
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = cleanMath(part.slice(2, -2));
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
          } catch (e) {
            return `<span class="text-amber-400 font-mono text-sm">${part}</span>`;
          }
        }

        if (part.startsWith('\\[') && part.endsWith('\\]')) {
          const math = cleanMath(part.slice(2, -2));
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
              strict: false,
            });
          } catch (e) {
            return `<span class="text-amber-400 font-mono text-sm">${part}</span>`;
          }
        }

        // Inline mode math: \(...\) or $...$
        if (part.startsWith('\\(') && part.endsWith('\\)')) {
          const math = cleanMath(part.slice(2, -2));
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
          } catch (e) {
            return `<span class="text-amber-400 font-mono text-sm">${part}</span>`;
          }
        }

        if (part.startsWith('$') && part.endsWith('$')) {
          const math = cleanMath(part.slice(1, -1));
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
              strict: false,
            });
          } catch (e) {
            return `<span class="text-amber-400 font-mono text-sm">${part}</span>`;
          }
        }

        // Standard text: preserve line breaks
        return part.replace(/\n/g, '<br />');
      })
      .join('');
  }, [content]);

  return (
    <span
      className={`inline-block leading-relaxed ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};

export default MathRenderer;
