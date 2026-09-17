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

    // Regex to detect $$block$$ and $inline$
    // Split by $$...$$ first, then by $...$
    const parts = content.split(/(\$\$[\s\S]+?\$\$|\$[^$\n]+?\$)/g);

    return parts
      .map((part) => {
        if (part.startsWith('$$') && part.endsWith('$$')) {
          const math = part.slice(2, -2);
          try {
            return katex.renderToString(math, {
              displayMode: true,
              throwOnError: false,
            });
          } catch (e) {
            return `<span class="text-red-400">${part}</span>`;
          }
        } else if (part.startsWith('$') && part.endsWith('$')) {
          const math = part.slice(1, -1);
          try {
            return katex.renderToString(math, {
              displayMode: false,
              throwOnError: false,
            });
          } catch (e) {
            return `<span class="text-red-400">${part}</span>`;
          }
        } else {
          // Replace newlines with <br /> for paragraph spacing
          return part.replace(/\n/g, '<br />');
        }
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
