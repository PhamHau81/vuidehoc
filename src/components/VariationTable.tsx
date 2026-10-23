import React from 'react';
import { MathView } from './MathView';

export interface BBTXPoint {
  label: string; // vd: "-\\infty", "-1", "1", "+\\infty"
  isAsymptote?: boolean; // Tiệm cận đứng ||
}

export interface BBTYPrimeInterval {
  sign: '+' | '-' | '';
}

export interface BBTYPrimePoint {
  val: '0' | '||' | '';
}

export interface BBTYNode {
  label: string;
  level: 'top' | 'mid-high' | 'mid' | 'mid-low' | 'bottom'; // độ cao
}

export interface BBTArrow {
  fromIndex: number;
  toIndex: number;
  fromLevel: 'top' | 'mid-high' | 'mid' | 'mid-low' | 'bottom';
  toLevel: 'top' | 'mid-high' | 'mid' | 'mid-low' | 'bottom';
  fromLabel: string;
  toLabel: string;
  direction: 'up' | 'down';
}

export interface VariationTableProps {
  title?: string;
  functionTex?: string;
  xPoints: string[]; // [ "-\\infty", "x_1", "x_2", "+\\infty" ]
  asymptoteIndices?: number[]; // Các chỉ số x là tiệm cận đứng ||
  yPrimeValues: string[]; // xen kẽ: [ "+", "0", "-", "0", "+" ] hoặc chỉ định
  arrows: BBTArrow[];
  className?: string;
}

export const VariationTable: React.FC<VariationTableProps> = ({
  title,
  functionTex,
  xPoints,
  asymptoteIndices = [],
  yPrimeValues,
  arrows,
  className = ''
}) => {
  // Bản đồ độ cao theo level cho SVG
  const levelYMap: Record<string, number> = {
    top: 24,
    'mid-high': 44,
    mid: 60,
    'mid-low': 76,
    bottom: 96
  };

  const colCount = xPoints.length;
  // Độ rộng cột
  const labelColWidth = 60;
  const contentWidth = 520;
  const colSpacing = contentWidth / (colCount - 1 || 1);

  return (
    <div className={`overflow-x-auto my-4 bg-white rounded-2xl border border-indigo-200/80 shadow-md p-4 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 inline-block animate-pulse"></span>
            <span className="font-extrabold text-sm text-slate-800">{title}</span>
          </div>
          {functionTex && (
            <div className="text-xs bg-indigo-50 text-indigo-900 px-2.5 py-1 rounded-lg border border-indigo-100 font-serif">
              <MathView content={`$${functionTex}$`} inline />
            </div>
          )}
        </div>
      )}

      <div className="min-w-[580px] select-none font-serif text-slate-800">
        <table className="w-full border-collapse border border-slate-300 rounded-xl overflow-hidden text-center text-xs sm:text-sm">
          <thead>
            {/* DÒNG X */}
            <tr className="bg-slate-50 border-b border-slate-300">
              <th className="w-16 border-r border-slate-300 py-2.5 px-3 font-bold italic text-indigo-950 text-base bg-indigo-50/50">
                <MathView content="$x$" inline />
              </th>
              <td colSpan={colCount * 2 - 1} className="py-2.5 px-4">
                <div className="flex justify-between items-center w-full px-2">
                  {xPoints.map((xp, idx) => (
                    <div
                      key={idx}
                      className={`font-semibold ${
                        asymptoteIndices.includes(idx) ? 'text-rose-600 font-bold' : 'text-slate-800'
                      }`}
                    >
                      <MathView content={`$${xp}$`} inline />
                    </div>
                  ))}
                </div>
              </td>
            </tr>

            {/* DÒNG Y' */}
            <tr className="bg-white border-b border-slate-300">
              <th className="border-r border-slate-300 py-2 px-3 font-bold italic text-indigo-950 text-base bg-indigo-50/50">
                <MathView content="$y'$" inline />
              </th>
              <td colSpan={colCount * 2 - 1} className="py-2 px-4">
                <div className="flex justify-around items-center w-full">
                  {yPrimeValues.map((yp, idx) => (
                    <div
                      key={idx}
                      className={`font-bold ${
                        yp === '||'
                          ? 'text-rose-500 font-black tracking-tighter text-sm'
                          : yp === '+'
                          ? 'text-emerald-600 text-base'
                          : yp === '-'
                          ? 'text-rose-600 text-base'
                          : 'text-slate-700'
                      }`}
                    >
                      {yp === '||' ? '||' : yp === '+' ? '+' : yp === '-' ? '−' : <MathView content={`$${yp}$`} inline />}
                    </div>
                  ))}
                </div>
              </td>
            </tr>
          </thead>

          {/* DÒNG Y VỚI MŨI TÊN SVG */}
          <tbody>
            <tr className="bg-slate-50/30">
              <th className="border-r border-slate-300 py-8 px-3 font-bold italic text-indigo-950 text-base bg-indigo-50/50 align-middle">
                <MathView content="$y$" inline />
              </th>
              <td colSpan={colCount * 2 - 1} className="p-0 relative h-[120px]">
                <svg
                  className="w-full h-[120px] absolute inset-0 pointer-events-none"
                  viewBox={`0 0 ${contentWidth} 120`}
                  preserveAspectRatio="none"
                >
                  <defs>
                    {/* Marker đầu mũi tên hướng lên / xuống */}
                    <marker
                      id="bbt-arrowhead-indigo"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 7 3, 0 6" fill="#4f46e5" />
                    </marker>
                    <marker
                      id="bbt-arrowhead-emerald"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 7 3, 0 6" fill="#059669" />
                    </marker>
                    <marker
                      id="bbt-arrowhead-rose"
                      markerWidth="8"
                      markerHeight="8"
                      refX="6"
                      refY="3"
                      orient="auto"
                    >
                      <polygon points="0 0, 7 3, 0 6" fill="#e11d48" />
                    </marker>
                  </defs>

                  {/* Kẻ đường gióng tiệm cận đứng nếu có */}
                  {asymptoteIndices.map((asympIdx) => {
                    const xCoord = (asympIdx / (colCount - 1)) * (contentWidth - 40) + 20;
                    return (
                      <g key={asympIdx}>
                        <line
                          x1={xCoord - 2}
                          y1="0"
                          x2={xCoord - 2}
                          y2="120"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                        />
                        <line
                          x1={xCoord + 2}
                          y1="0"
                          x2={xCoord + 2}
                          y2="120"
                          stroke="#f43f5e"
                          strokeWidth="1.5"
                        />
                      </g>
                    );
                  })}

                  {/* Vẽ các mũi tên biến thiên */}
                  {arrows.map((arr, aIdx) => {
                    const margin = 24;
                    const availableWidth = contentWidth - margin * 2;
                    const x1 = margin + (arr.fromIndex / (colCount - 1)) * availableWidth;
                    const x2 = margin + (arr.toIndex / (colCount - 1)) * availableWidth;
                    const y1 = levelYMap[arr.fromLevel] || 60;
                    const y2 = levelYMap[arr.toLevel] || 60;

                    // Rút ngắn 1 chút ở 2 đầu để không đè vào chữ
                    const dx = x2 - x1;
                    const dy = y2 - y1;
                    const length = Math.sqrt(dx * dx + dy * dy);
                    const padStart = 16;
                    const padEnd = 16;
                    const startX = x1 + (dx / length) * padStart;
                    const startY = y1 + (dy / length) * padStart;
                    const endX = x2 - (dx / length) * padEnd;
                    const endY = y2 - (dy / length) * padEnd;

                    const strokeColor = arr.direction === 'up' ? '#059669' : '#e11d48';
                    const markerId = arr.direction === 'up' ? 'bbt-arrowhead-emerald' : 'bbt-arrowhead-rose';

                    return (
                      <g key={aIdx}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke={strokeColor}
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          markerEnd={`url(#${markerId})`}
                        />
                      </g>
                    );
                  })}
                </svg>

                {/* Các nhãn giá trị ở đầu và đuôi mũi tên */}
                <div className="absolute inset-0 px-6 pointer-events-none flex justify-between items-stretch">
                  {xPoints.map((_, xIdx) => {
                    // Tìm các arrow bắt đầu hoặc kết thúc tại cột này
                    const outgoing = arrows.find((a) => a.fromIndex === xIdx);
                    const incoming = arrows.find((a) => a.toIndex === xIdx);

                    return (
                      <div key={xIdx} className="relative flex flex-col justify-between py-1 h-full w-0">
                        {outgoing && (
                          <div
                            className="absolute whitespace-nowrap -translate-x-1/2 font-bold text-xs"
                            style={{ top: `${levelYMap[outgoing.fromLevel] - 12}px` }}
                          >
                            <MathView content={`$${outgoing.fromLabel}$`} inline />
                          </div>
                        )}
                        {incoming && !outgoing && (
                          <div
                            className="absolute whitespace-nowrap -translate-x-1/2 font-bold text-xs"
                            style={{ top: `${levelYMap[incoming.toLevel] - 12}px` }}
                          >
                            <MathView content={`$${incoming.toLabel}$`} inline />
                          </div>
                        )}
                        {incoming && outgoing && incoming.toLevel !== outgoing.fromLevel && (
                          <div
                            className="absolute whitespace-nowrap -translate-x-1/2 font-bold text-xs"
                            style={{ top: `${levelYMap[incoming.toLevel] - 12}px` }}
                          >
                            <MathView content={`$${incoming.toLabel}$`} inline />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div className="mt-2 text-[11px] text-slate-400 italic text-right flex items-center justify-end gap-3">
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-emerald-600 inline-block"></span> Mũi tên xanh: Đồng biến
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2.5 h-0.5 bg-rose-600 inline-block"></span> Mũi tên đỏ: Nghịch biến
        </span>
      </div>
    </div>
  );
};
