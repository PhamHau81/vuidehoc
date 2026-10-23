import React, { useEffect, useState, useMemo } from 'react';

declare global {
  interface Window {
    katex?: {
      render: (tex: string, element: HTMLElement, options?: Record<string, unknown>) => void;
      renderToString: (tex: string, options?: Record<string, unknown>) => string;
    };
    renderMathInElement?: (
      element: HTMLElement,
      options?: {
        delimiters: Array<{ left: string; right: string; display: boolean }>;
        throwOnError?: boolean;
        macros?: Record<string, string>;
      }
    ) => void;
  }
}

interface MathViewProps {
  content: string;
  className?: string;
  inline?: boolean;
}

/**
 * Bộ tiền xử lý công thức toán học MathType & TeX chuyên sâu
 * Tự động sửa các lỗi thường gặp khi xuất từ MathType hoặc Word sang web:
 * - Chuẩn hóa vector 2 điểm: \vec{AB} -> \overrightarrow{AB}
 * - Chuẩn hóa các macro vector phổ biến: \vecto, \vt, \vv
 * - Tối ưu tích vô hướng, tích có hướng, độ dài vectơ
 * - Khắc phục các tag MathType rác: {\rm }, {\bf }, &nbsp;, v.v.
 */
export function preprocessMathType(raw: string): string {
  if (!raw) return '';

  // Chuẩn hóa Unicode dựng sẵn NFC để dấu tiếng Việt luôn chuẩn xác 100%
  let text = typeof raw === 'string' ? raw.normalize('NFC') : String(raw);

  // 1. Sửa các ký tự entity HTML lẫn vào công thức
  text = text.replace(/&nbsp;/g, ' ');
  text = text.replace(/&lt;/g, '<');
  text = text.replace(/&gt;/g, '>');
  text = text.replace(/&amp;/g, '&');

  // 2. Chuẩn hóa công thức vectơ MathType
  // Vector 2 chữ cái viết hoa (AB, BC, CD, MN, PQ, v.v.): trong MathType hay để \vec{AB} hoặc \vec AB
  // KaTeX hiển thị \vec{AB} rất xấu (mũi tên cụt ở chữ A). Phải chuyển sang \overrightarrow{AB}!
  text = text.replace(/\\vec\s*\{([A-Z]{2,3})\}/g, '\\overrightarrow{$1}');
  text = text.replace(/\\vec\s+([A-Z]{2,3})(?![a-zA-Z])/g, '\\overrightarrow{$1}');

  // Chuẩn hóa \vt{...}, \vecto{...}, \vv{...} do giáo viên hay gõ tắt
  text = text.replace(/\\(vecto|vt|vv)\s*\{([A-Z]{2,3})\}/g, '\\overrightarrow{$2}');
  text = text.replace(/\\(vecto|vt|vv)\s*\{([a-z0-9_]+)\}/g, '\\vec{$2}');
  text = text.replace(/\\(vecto|vt|vv)\s+([A-Z]{2,3})(?![a-zA-Z])/g, '\\overrightarrow{$2}');
  text = text.replace(/\\(vecto|vt|vv)\s+([a-z0-9])(?![a-zA-Z])/g, '\\vec{$2}');

  // Tích vô hướng: \vec{a}.\vec{b} hoặc \vec{a} . \vec{b} -> \vec{a} \cdot \vec{b}
  text = text.replace(/(\\vec\{[a-z0-9]\})\s*\.\s*(\\vec\{[a-z0-9]\})/g, '$1 \\cdot $2');
  text = text.replace(/(\\overrightarrow\{[A-Z]+\})\s*\.\s*(\\overrightarrow\{[A-Z]+\})/g, '$1 \\cdot $2');

  // Góc giữa hai vectơ: (\vec{a}, \vec{b})
  text = text.replace(/\((\\vec\{[a-z]\})\s*,\s*(\\vec\{[a-z]\})\)/g, '($1,\\,\\vec{$2})');

  // Ký hiệu góc: \widehat{ABC} hoặc \angle ABC
  text = text.replace(/\\hat\s*\{([A-Z]{3})\}/g, '\\widehat{$1}');

  // Ký hiệu độ: 60^o, 90^o, 45^o -> 60^\circ
  text = text.replace(/(\d+)\s*\^[oO]\b/g, '$1^\\circ');

  // 3. Khắc phục các tag định dạng cũ từ MathType
  text = text.replace(/\{\\rm\s+([^}]+)\}/g, '\\mathrm{$1}');
  text = text.replace(/\{\\bf\s+([^}]+)\}/g, '\\mathbf{$1}');
  text = text.replace(/\{\\it\s+([^}]+)\}/g, '\\mathit{$1}');
  text = text.replace(/\{\\cal\s+([^}]+)\}/g, '\\mathcal{$1}');

  // 4. Chuẩn hóa song song và vuông góc
  text = text.replace(/\\parallel/g, '\\mathrel{/\\!/}');

  return text;
}

// Bộ KaTeX macros phong phú
const KATEX_MACROS = {
  '\\vecto': '\\overrightarrow',
  '\\vt': '\\overrightarrow',
  '\\vv': '\\overrightarrow',
  '\\degree': '^\\circ',
  '\\parallel': '\\mathrel{/\\!/}',
  '\\Oxy': 'Oxy',
  '\\Oxyz': 'Oxyz',
  '\\R': '\\mathbb{R}',
  '\\N': '\\mathbb{N}',
  '\\Z': '\\mathbb{Z}',
  '\\Q': '\\mathbb{Q}',
  '\\C': '\\mathbb{C}',
  '\\dx': '\\,\\mathrm{d}x',
  '\\dy': '\\,\\mathrm{d}y',
  '\\dz': '\\,\\mathrm{d}z',
  '\\dt': '\\,\\mathrm{d}t'
};

/**
 * Render công thức TeX an toàn bằng katex.renderToString
 */
function renderTex(math: string, displayMode: boolean): string {
  if (typeof window !== 'undefined' && window.katex && window.katex.renderToString) {
    try {
      const cleaned = preprocessMathType(math.trim());
      return window.katex.renderToString(cleaned, {
        displayMode,
        throwOnError: false,
        strict: false,
        trust: true,
        macros: KATEX_MACROS
      });
    } catch {
      return displayMode ? `\\[${math}\\]` : `$${math}$`;
    }
  }
  return displayMode ? `\\[${math}\\]` : `$${math}$`;
}

/**
 * Tokenize chuỗi kết hợp HTML và toán học ($...$, $$...$$, \(...\), \[...\])
 */
export function renderMixedContent(rawHtml: string): string {
  if (!rawHtml) return '';

  const regex = /(\$\$[\s\S]*?\$\$|\\\[[\s\S]*?\\\]|\$[^\$\n]+?\$|\\\([\s\S]*?\\\))/g;

  return rawHtml.replace(regex, (match) => {
    if (match.startsWith('$$') && match.endsWith('$$')) {
      const formula = match.slice(2, -2);
      return `<span class="katex-display-wrapper my-2.5 block text-center overflow-x-auto">${renderTex(formula, true)}</span>`;
    }
    if (match.startsWith('\\[') && match.endsWith('\\]')) {
      const formula = match.slice(2, -2);
      return `<span class="katex-display-wrapper my-2.5 block text-center overflow-x-auto">${renderTex(formula, true)}</span>`;
    }
    if (match.startsWith('$') && match.endsWith('$')) {
      const formula = match.slice(1, -1);
      return `<span class="katex-inline-wrapper inline-block mx-0.5">${renderTex(formula, false)}</span>`;
    }
    if (match.startsWith('\\(') && match.endsWith('\\)')) {
      const formula = match.slice(2, -2);
      return `<span class="katex-inline-wrapper inline-block mx-0.5">${renderTex(formula, false)}</span>`;
    }
    return match;
  });
}

export const MathView: React.FC<MathViewProps> = ({ content, className = '', inline = false }) => {
  const [katexLoaded, setKatexLoaded] = useState(() => {
    return typeof window !== 'undefined' && !!window.katex;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.katex) {
      setKatexLoaded(true);
      return;
    }

    const interval = setInterval(() => {
      if (window.katex) {
        setKatexLoaded(true);
        clearInterval(interval);
      }
    }, 150);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  const renderedHtml = useMemo(() => {
    return renderMixedContent(content);
  }, [content, katexLoaded]);

  if (inline) {
    return (
      <span
        className={`math-content leading-relaxed ${className}`}
        dangerouslySetInnerHTML={{ __html: renderedHtml }}
      />
    );
  }

  return (
    <div
      className={`math-content leading-relaxed text-slate-800 ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
};
