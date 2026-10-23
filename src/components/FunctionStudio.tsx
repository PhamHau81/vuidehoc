import React, { useState, useMemo } from 'react';
import { MathView } from './MathView';
import { VariationTable, BBTArrow } from './VariationTable';
import { FunctionGraph, KeyPoint, Asymptote } from './FunctionGraph';
import { 
  LineChart, 
  TableProperties, 
  Sparkles, 
  Sliders, 
  HelpCircle, 
  BookOpen, 
  CheckCircle,
  Layers,
  ArrowRight
} from 'lucide-react';

type FunctionFamily = 'cubic' | 'rational_1_1' | 'quartic' | 'parabola';

interface PresetExample {
  label: string;
  family: FunctionFamily;
  params: Record<string, number>;
  description: string;
}

const PRESET_EXAMPLES: PresetExample[] = [
  {
    label: 'Hàm bậc 3 có 2 cực trị (Đề thi THPT)',
    family: 'cubic',
    params: { a: 1, b: 0, c: -3, d: 2 },
    description: 'Hàm số $y = x^3 - 3x + 2$ có cực đại tại $(-1; 4)$ và cực tiểu tại $(1; 0)$.'
  },
  {
    label: 'Hàm bậc 3 nghịch biến (Hệ số a âm)',
    family: 'cubic',
    params: { a: -1, b: 3, c: 0, d: -1 },
    description: 'Hàm số $y = -x^3 + 3x^2 - 1$ có cực tiểu tại $(0; -1)$ và cực đại tại $(2; 3)$.'
  },
  {
    label: 'Hàm phân thức bậc nhất / bậc nhất',
    family: 'rational_1_1',
    params: { a: 2, b: -1, c: 1, d: 1 },
    description: 'Hàm số $y = \\frac{2x - 1}{x + 1}$ đồng biến trên từng khoảng xác định, TCĐ $x = -1$, TCN $y = 2$.'
  },
  {
    label: 'Hàm phân thức nghịch biến',
    family: 'rational_1_1',
    params: { a: 1, b: 2, c: 1, d: -1 },
    description: 'Hàm số $y = \\frac{x + 2}{x - 1}$ nghịch biến, TCĐ $x = 1$, TCN $y = 1$.'
  },
  {
    label: 'Hàm trùng phương 3 cực trị',
    family: 'quartic',
    params: { a: -1, b: 2, c: 1, d: 0 },
    description: 'Hàm số $y = -x^4 + 2x^2 + 1$ có hình chữ M với 2 cực đại và 1 cực tiểu.'
  },
  {
    label: 'Hàm bậc hai Parabol',
    family: 'parabola',
    params: { a: 1, b: -4, c: 3, d: 0 },
    description: 'Hàm số $y = x^2 - 4x + 3$ có đỉnh $I(2; -1)$, bề lõm quay lên.'
  }
];

export const FunctionStudio: React.FC = () => {
  const [selectedFamily, setSelectedFamily] = useState<FunctionFamily>('cubic');
  const [activeTab, setActiveTab] = useState<'both' | 'table' | 'graph'>('both');

  // Parameters
  const [params, setParams] = useState<Record<string, number>>({
    a: 1,
    b: 0,
    c: -3,
    d: 2
  });

  const handleSelectExample = (ex: PresetExample) => {
    setSelectedFamily(ex.family);
    setParams(ex.params);
  };

  // Tính toán khảo sát theo từng dạng hàm số
  const analysis = useMemo(() => {
    const { a = 1, b = 0, c = 0, d = 0 } = params;

    if (selectedFamily === 'cubic') {
      // y = a*x^3 + b*x^2 + c*x + d
      // y' = 3a*x^2 + 2b*x + c
      const delta = 4 * b * b - 12 * a * c;
      const fnTex = `y = ${a !== 1 ? (a === -1 ? '-' : a) : ''}x^3 ${
        b ? (b > 0 ? `+ ${b === 1 ? '' : b}x^2` : `- ${Math.abs(b) === 1 ? '' : Math.abs(b)}x^2`) : ''
      } ${
        c ? (c > 0 ? `+ ${c === 1 ? '' : c}x` : `- ${Math.abs(c) === 1 ? '' : Math.abs(c)}x`) : ''
      } ${
        d ? (d > 0 ? `+ ${d}` : `- ${Math.abs(d)}`) : ''
      }`.replace(/\s+/g, ' ');

      const evalFn = (x: number) => a * x * x * x + b * x * x + c * x + d;
      const derivFn = (x: number) => 3 * a * x * x + 2 * b * x + c;

      // Tìm cực trị nếu delta > 0
      let keyPoints: KeyPoint[] = [];
      let xPoints: string[] = ['-\\infty', '+\\infty'];
      let yPrimeValues: string[] = ['+', '+'];
      let arrows: BBTArrow[] = [];

      if (delta > 0 && a !== 0) {
        const x1 = (-2 * b - Math.sqrt(delta)) / (6 * a);
        const x2 = (-2 * b + Math.sqrt(delta)) / (6 * a);
        const [xA, xB] = x1 < x2 ? [x1, x2] : [x2, x1];
        const yA = evalFn(xA);
        const yB = evalFn(xB);

        const xAStr = Number(xA.toFixed(2)).toString();
        const xBStr = Number(xB.toFixed(2)).toString();
        const yAStr = Number(yA.toFixed(2)).toString();
        const yBStr = Number(yB.toFixed(2)).toString();

        xPoints = ['-\\infty', xAStr, xBStr, '+\\infty'];

        if (a > 0) {
          // + 0 - 0 + -> xA là CĐ, xB là CT
          yPrimeValues = ['+', '0', '-', '0', '+'];
          arrows = [
            {
              fromIndex: 0,
              toIndex: 1,
              fromLevel: 'bottom',
              toLevel: 'top',
              fromLabel: '-\\infty',
              toLabel: yAStr,
              direction: 'up'
            },
            {
              fromIndex: 1,
              toIndex: 2,
              fromLevel: 'top',
              toLevel: 'bottom',
              fromLabel: yAStr,
              toLabel: yBStr,
              direction: 'down'
            },
            {
              fromIndex: 2,
              toIndex: 3,
              fromLevel: 'bottom',
              toLevel: 'top',
              fromLabel: yBStr,
              toLabel: '+\\infty',
              direction: 'up'
            }
          ];
          keyPoints = [
            { x: xA, y: yA, label: `CĐ(${xAStr}; ${yAStr})`, type: 'max' },
            { x: xB, y: yB, label: `CT(${xBStr}; ${yBStr})`, type: 'min' }
          ];
        } else {
          // a < 0: - 0 + 0 - -> xA là CT, xB là CĐ
          yPrimeValues = ['-', '0', '+', '0', '-'];
          arrows = [
            {
              fromIndex: 0,
              toIndex: 1,
              fromLevel: 'top',
              toLevel: 'bottom',
              fromLabel: '+\\infty',
              toLabel: yAStr,
              direction: 'down'
            },
            {
              fromIndex: 1,
              toIndex: 2,
              fromLevel: 'bottom',
              toLevel: 'top',
              fromLabel: yAStr,
              toLabel: yBStr,
              direction: 'up'
            },
            {
              fromIndex: 2,
              toIndex: 3,
              fromLevel: 'top',
              toLevel: 'bottom',
              fromLabel: yBStr,
              toLabel: '-\\infty',
              direction: 'down'
            }
          ];
          keyPoints = [
            { x: xA, y: yA, label: `CT(${xAStr}; ${yAStr})`, type: 'min' },
            { x: xB, y: yB, label: `CĐ(${xBStr}; ${yBStr})`, type: 'max' }
          ];
        }

        // Điểm uốn
        const xInflect = -b / (3 * a);
        const yInflect = evalFn(xInflect);
        keyPoints.push({
          x: xInflect,
          y: yInflect,
          label: `I(${Number(xInflect.toFixed(1))}; ${Number(yInflect.toFixed(1))})`,
          type: 'inflection'
        });
      } else {
        // Vô nghiệm hoặc nghiệm kép
        yPrimeValues = a > 0 ? ['+', '+'] : ['-', '-'];
        arrows = [
          {
            fromIndex: 0,
            toIndex: 1,
            fromLevel: a > 0 ? 'bottom' : 'top',
            toLevel: a > 0 ? 'top' : 'bottom',
            fromLabel: a > 0 ? '-\\infty' : '+\\infty',
            toLabel: a > 0 ? '+\\infty' : '-\\infty',
            direction: a > 0 ? 'up' : 'down'
          }
        ];
      }

      // Giao điểm trục tung
      keyPoints.push({ x: 0, y: d, label: `(0; ${d})`, type: 'intercept' });

      return {
        fnTex,
        evalFn,
        derivFn,
        xPoints,
        yPrimeValues,
        arrows,
        keyPoints,
        asymptotes: [],
        theoryNotes: [
          'Tập xác định: $D = \\mathbb{R}$.',
          `Đạo hàm: $y' = 3(${a})x^2 + 2(${b})x + (${c}) = ${3 * a}x^2 + ${2 * b}x + ${c}$.`,
          delta > 0
            ? 'Đạo hàm có 2 nghiệm phân biệt: Hàm số có 2 điểm cực trị.'
            : 'Đạo hàm không đổi dấu: Hàm số luôn đơn điệu trên $\\mathbb{R}$ và không có cực trị.',
          `Tâm đối xứng là điểm uốn $I\\left(${Number((-b / (3 * a)).toFixed(2))}; ${Number(
            evalFn(-b / (3 * a)).toFixed(2)
          )}\\right)$.`
        ]
      };
    }

    if (selectedFamily === 'rational_1_1') {
      // y = (ax + b) / (cx + d)
      const cVal = c !== 0 ? c : 1;
      const det = a * d - b * cVal;
      const vertAsymp = -d / cVal;
      const horizAsymp = a / cVal;

      const vertStr = Number(vertAsymp.toFixed(2)).toString();
      const horizStr = Number(horizAsymp.toFixed(2)).toString();

      const fnTex = `y = \\frac{${a}x ${b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`}}{${
        cVal === 1 ? '' : cVal === -1 ? '-' : cVal
      }x ${d >= 0 ? `+ ${d}` : `- ${Math.abs(d)}}`}`;

      const evalFn = (x: number) => {
        if (Math.abs(x - vertAsymp) < 0.001) return null;
        return (a * x + b) / (cVal * x + d);
      };

      const xPoints = ['-\\infty', vertStr, '+\\infty'];
      const sign = det > 0 ? '+' : '-';
      const yPrimeValues = [sign, '||', sign];

      const arrows: BBTArrow[] =
        det > 0
          ? [
              {
                fromIndex: 0,
                toIndex: 1,
                fromLevel: 'mid',
                toLevel: 'top',
                fromLabel: horizStr,
                toLabel: '+\\infty',
                direction: 'up'
              },
              {
                fromIndex: 1,
                toIndex: 2,
                fromLevel: 'bottom',
                toLevel: 'mid',
                fromLabel: '-\\infty',
                toLabel: horizStr,
                direction: 'up'
              }
            ]
          : [
              {
                fromIndex: 0,
                toIndex: 1,
                fromLevel: 'mid',
                toLevel: 'bottom',
                fromLabel: horizStr,
                toLabel: '-\\infty',
                direction: 'down'
              },
              {
                fromIndex: 1,
                toIndex: 2,
                fromLevel: 'top',
                toLevel: 'mid',
                fromLabel: '+\\infty',
                toLabel: horizStr,
                direction: 'down'
              }
            ];

      const asymptotes: Asymptote[] = [
        { type: 'vertical', value: vertAsymp, label: `x = ${vertStr}` },
        { type: 'horizontal', value: horizAsymp, label: `y = ${horizStr}` }
      ];

      const keyPoints: KeyPoint[] = [
        {
          x: vertAsymp,
          y: horizAsymp,
          label: `I(${vertStr}; ${horizStr})`,
          type: 'inflection'
        }
      ];

      // Giao trục tung
      if (d !== 0) {
        keyPoints.push({ x: 0, y: b / d, label: `(0; ${Number((b / d).toFixed(2))})`, type: 'intercept' });
      }

      return {
        fnTex,
        evalFn,
        derivFn: (x: number) => det / Math.pow(cVal * x + d, 2),
        xPoints,
        asymptoteIndices: [1],
        yPrimeValues,
        arrows,
        keyPoints,
        asymptotes,
        theoryNotes: [
          `Tập xác định: $D = \\mathbb{R} \\setminus \\{${vertStr}\\}$.`,
          `Đạo hàm: $y' = \\frac{ad - bc}{(cx + d)^2} = \\frac{${det}}{(${cVal}x + ${d})^2}$ ${
            det > 0 ? '> 0' : '< 0'
          } $\\forall x \\ne ${vertStr}$.`,
          det > 0
            ? 'Hàm số đồng biến trên từng khoảng $(-\\infty; ' + vertStr + ')$ và $(' + vertStr + '; +\\infty)$.'
            : 'Hàm số nghịch biến trên từng khoảng $(-\\infty; ' + vertStr + ')$ và $(' + vertStr + '; +\\infty)$.',
          `Tiệm cận đứng: $x = ${vertStr}$; Tiệm cận ngang: $y = ${horizStr}$.`,
          `Tâm đối xứng: Giao điểm hai đường tiệm cận $I(${vertStr}; ${horizStr})$.`
        ]
      };
    }

    if (selectedFamily === 'quartic') {
      // y = ax^4 + bx^2 + c
      const fnTex = `y = ${a !== 1 ? (a === -1 ? '-' : a) : ''}x^4 ${
        b ? (b > 0 ? `+ ${b}x^2` : `- ${Math.abs(b)}x^2`) : ''
      } ${c ? (c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`) : ''}`.replace(/\s+/g, ' ');

      const evalFn = (x: number) => a * Math.pow(x, 4) + b * Math.pow(x, 2) + c;

      // y' = 4ax^3 + 2bx = 2x(2ax^2 + b)
      const has3Extremes = -b / (2 * a) > 0;
      let xPoints = ['-\\infty', '0', '+\\infty'];
      let yPrimeValues = ['-', '0', '+'];
      let arrows: BBTArrow[] = [];
      let keyPoints: KeyPoint[] = [{ x: 0, y: c, label: `(0; ${c})`, type: a > 0 ? 'min' : 'max' }];

      if (has3Extremes) {
        const xVal = Math.sqrt(-b / (2 * a));
        const xStr1 = (-xVal).toFixed(2);
        const xStr2 = xVal.toFixed(2);
        const yVal = evalFn(xVal);
        const yStr = yVal.toFixed(2);

        xPoints = ['-\\infty', xStr1, '0', xStr2, '+\\infty'];

        if (a > 0) {
          // W-shape: - 0 + 0 - 0 +
          yPrimeValues = ['-', '0', '+', '0', '-', '0', '+'];
          arrows = [
            { fromIndex: 0, toIndex: 1, fromLevel: 'top', toLevel: 'bottom', fromLabel: '+\\infty', toLabel: yStr, direction: 'down' },
            { fromIndex: 1, toIndex: 2, fromLevel: 'bottom', toLevel: 'mid', fromLabel: yStr, toLabel: c.toString(), direction: 'up' },
            { fromIndex: 2, toIndex: 3, fromLevel: 'mid', toLevel: 'bottom', fromLabel: c.toString(), toLabel: yStr, direction: 'down' },
            { fromIndex: 3, toIndex: 4, fromLevel: 'bottom', toLevel: 'top', fromLabel: yStr, toLabel: '+\\infty', direction: 'up' }
          ];
          keyPoints = [
            { x: -xVal, y: yVal, label: `CT(${xStr1}; ${yStr})`, type: 'min' },
            { x: 0, y: c, label: `CĐ(0; ${c})`, type: 'max' },
            { x: xVal, y: yVal, label: `CT(${xStr2}; ${yStr})`, type: 'min' }
          ];
        } else {
          // M-shape: + 0 - 0 + 0 -
          yPrimeValues = ['+', '0', '-', '0', '+', '0', '-'];
          arrows = [
            { fromIndex: 0, toIndex: 1, fromLevel: 'bottom', toLevel: 'top', fromLabel: '-\\infty', toLabel: yStr, direction: 'up' },
            { fromIndex: 1, toIndex: 2, fromLevel: 'top', toLevel: 'mid', fromLabel: yStr, toLabel: c.toString(), direction: 'down' },
            { fromIndex: 2, toIndex: 3, fromLevel: 'mid', toLevel: 'top', fromLabel: c.toString(), toLabel: yStr, direction: 'up' },
            { fromIndex: 3, toIndex: 4, fromLevel: 'top', toLevel: 'bottom', fromLabel: yStr, toLabel: '-\\infty', direction: 'down' }
          ];
          keyPoints = [
            { x: -xVal, y: yVal, label: `CĐ(${xStr1}; ${yStr})`, type: 'max' },
            { x: 0, y: c, label: `CT(0; ${c})`, type: 'min' },
            { x: xVal, y: yVal, label: `CĐ(${xStr2}; ${yStr})`, type: 'max' }
          ];
        }
      } else {
        // 1 cực trị tại x = 0
        arrows = a > 0 ? [
          { fromIndex: 0, toIndex: 1, fromLevel: 'top', toLevel: 'bottom', fromLabel: '+\\infty', toLabel: c.toString(), direction: 'down' },
          { fromIndex: 1, toIndex: 2, fromLevel: 'bottom', toLevel: 'top', fromLabel: c.toString(), toLabel: '+\\infty', direction: 'up' }
        ] : [
          { fromIndex: 0, toIndex: 1, fromLevel: 'bottom', toLevel: 'top', fromLabel: '-\\infty', toLabel: c.toString(), direction: 'up' },
          { fromIndex: 1, toIndex: 2, fromLevel: 'top', toLevel: 'bottom', fromLabel: c.toString(), toLabel: '-\\infty', direction: 'down' }
        ];
      }

      return {
        fnTex,
        evalFn,
        derivFn: (x: number) => 4 * a * Math.pow(x, 3) + 2 * b * x,
        xPoints,
        yPrimeValues,
        arrows,
        keyPoints,
        asymptotes: [],
        theoryNotes: [
          'Tập xác định: $D = \\mathbb{R}$.',
          `Hàm số chẵn, đồ thị nhận trục tung $Oy$ làm trục đối xứng.`,
          has3Extremes
            ? 'Tích $ab < 0$: Hàm số có 3 điểm cực trị (tạo thành tam giác cân nhận $Oy$ làm trục đối xứng).'
            : 'Tích $ab \\ge 0$: Hàm số có duy nhất 1 điểm cực trị tại $x = 0$.'
        ]
      };
    }

    // Parabola: y = ax^2 + bx + c
    const aVal = a !== 0 ? a : 1;
    const xVertex = -b / (2 * aVal);
    const yVertex = aVal * xVertex * xVertex + b * xVertex + c;
    const xVStr = Number(xVertex.toFixed(2)).toString();
    const yVStr = Number(yVertex.toFixed(2)).toString();

    const fnTex = `y = ${aVal !== 1 ? (aVal === -1 ? '-' : aVal) : ''}x^2 ${
      b ? (b > 0 ? `+ ${b}x` : `- ${Math.abs(b)}x`) : ''
    } ${c ? (c > 0 ? `+ ${c}` : `- ${Math.abs(c)}`) : ''}`;

    const evalFn = (x: number) => aVal * x * x + b * x + c;

    const xPoints = ['-\\infty', xVStr, '+\\infty'];
    const yPrimeValues = aVal > 0 ? ['-', '0', '+'] : ['+', '0', '-'];
    const arrows: BBTArrow[] =
      aVal > 0
        ? [
            { fromIndex: 0, toIndex: 1, fromLevel: 'top', toLevel: 'bottom', fromLabel: '+\\infty', toLabel: yVStr, direction: 'down' },
            { fromIndex: 1, toIndex: 2, fromLevel: 'bottom', toLevel: 'top', fromLabel: yVStr, toLabel: '+\\infty', direction: 'up' }
          ]
        : [
            { fromIndex: 0, toIndex: 1, fromLevel: 'bottom', toLevel: 'top', fromLabel: '-\\infty', toLabel: yVStr, direction: 'up' },
            { fromIndex: 1, toIndex: 2, fromLevel: 'top', toLevel: 'bottom', fromLabel: yVStr, toLabel: '-\\infty', direction: 'down' }
          ];

    return {
      fnTex,
      evalFn,
      derivFn: (x: number) => 2 * aVal * x + b,
      xPoints,
      yPrimeValues,
      arrows,
      keyPoints: [
        { x: xVertex, y: yVertex, label: `I(${xVStr}; ${yVStr})`, type: aVal > 0 ? 'min' : 'max' },
        { x: 0, y: c, label: `(0; ${c})`, type: 'intercept' }
      ],
      asymptotes: [],
      theoryNotes: [
        'Tập xác định: $D = \\mathbb{R}$.',
        `Tọa độ đỉnh Parabol: $I\\left(${xVStr}; ${yVStr}\\right)$.`,
        `Trục đối xứng: Đường thẳng $x = ${xVStr}$.`,
        aVal > 0 ? 'Bề lõm quay lên trên, hàm số có giá trị nhỏ nhất.' : 'Bề lõm quay xuống dưới, hàm số có giá trị lớn nhất.'
      ]
    };
  }, [selectedFamily, params]);

  return (
    <div className="space-y-6">
      {/* Title & Introduction */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black tracking-widest text-amber-400 uppercase mb-2">
            <Sparkles className="w-4 h-4" />
            <span>CÔNG CỤ ĐỒ HỌA TOÁN HỌC CHUYÊN SÂU</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Xưởng Khảo Sát Hàm Số, Bảng Biến Thiên & Đồ Thị Đẹp Mắt
          </h2>
          <p className="text-sm text-indigo-200 leading-relaxed">
            Hỗ trợ vẽ chuẩn xác 100% các dạng hàm số trọng tâm kỳ thi THPT: <b>Bậc ba</b>, <b>Phân thức hữu tỉ</b>, <b>Bậc bốn trùng phương</b> và <b>Parabol</b>. Tự động lập bảng biến thiên sư phạm và trực quan hóa đồ thị tọa độ $Oxy$.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="mt-6 pt-5 border-t border-indigo-800/80">
          <div className="text-xs font-bold text-indigo-300 mb-2.5 flex items-center gap-2">
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            <span>Chọn nhanh dạng đồ thị mẫu trong đề thi THPT:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESET_EXAMPLES.map((ex, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectExample(ex)}
                className="px-3 py-1.5 rounded-xl text-xs font-bold bg-indigo-800/70 hover:bg-indigo-700/90 text-indigo-100 hover:text-white border border-indigo-700/50 transition shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <span>{ex.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Control Panel: Parameters & Family Selector */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
          {/* Family selection */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Họ hàm số:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { id: 'cubic', name: 'Bậc ba' },
                { id: 'rational_1_1', name: 'Phân thức bậc nhất' },
                { id: 'quartic', name: 'Trùng phương' },
                { id: 'parabola', name: 'Bậc hai Parabol' }
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => {
                    setSelectedFamily(f.id as FunctionFamily);
                    if (f.id === 'cubic') setParams({ a: 1, b: 0, c: -3, d: 2 });
                    if (f.id === 'rational_1_1') setParams({ a: 2, b: -1, c: 1, d: 1 });
                    if (f.id === 'quartic') setParams({ a: -1, b: 2, c: 1, d: 0 });
                    if (f.id === 'parabola') setParams({ a: 1, b: -4, c: 3, d: 0 });
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-extrabold transition ${
                    selectedFamily === f.id
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>

          {/* View Mode */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setActiveTab('both')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTab === 'both' ? 'bg-white shadow-2xs text-indigo-600 font-black' : 'text-slate-600'
              }`}
            >
              Song song (BBT + Đồ thị)
            </button>
            <button
              onClick={() => setActiveTab('table')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTab === 'table' ? 'bg-white shadow-2xs text-indigo-600 font-black' : 'text-slate-600'
              }`}
            >
              Bảng biến thiên
            </button>
            <button
              onClick={() => setActiveTab('graph')}
              className={`px-2.5 py-1 rounded-lg transition ${
                activeTab === 'graph' ? 'bg-white shadow-2xs text-indigo-600 font-black' : 'text-slate-600'
              }`}
            >
              Đồ thị Oxy
            </button>
          </div>
        </div>

        {/* Sliders / Inputs for parameters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-1">
          {Object.keys(params).map((key) => {
            if (selectedFamily === 'parabola' && key === 'd') return null;
            if (selectedFamily === 'quartic' && (key === 'd' || key === 'b' && false)) return null;
            return (
              <div key={key} className="bg-slate-50 p-3 rounded-xl border border-slate-200/70">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                  <span>Hệ số {key}:</span>
                  <span className="font-mono bg-white px-2 py-0.5 rounded-md border border-slate-200 text-indigo-600 font-extrabold">
                    {params[key]}
                  </span>
                </div>
                <input
                  type="range"
                  min={key === 'a' && selectedFamily !== 'parabola' ? -3 : -5}
                  max={5}
                  step={key === 'a' ? 0.5 : 1}
                  value={params[key]}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setParams((p) => ({ ...p, [key]: val }));
                  }}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Display: Bảng biến thiên & Đồ thị */}
      <div className={`grid gap-6 ${activeTab === 'both' ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Cột 1: Bảng biến thiên */}
        {(activeTab === 'both' || activeTab === 'table') && (
          <div className="space-y-4">
            <VariationTable
              title="Bảng biến thiên chuẩn sư phạm"
              functionTex={analysis.fnTex}
              xPoints={analysis.xPoints}
              asymptoteIndices={analysis.asymptoteIndices}
              yPrimeValues={analysis.yPrimeValues}
              arrows={analysis.arrows}
            />

            {/* Khảo sát chi tiết */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
              <div className="font-extrabold text-sm text-slate-900 flex items-center gap-2 pb-2 border-b border-slate-100">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Kết luận khảo sát giải tích:</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 leading-relaxed font-sans">
                {analysis.theoryNotes.map((note, nIdx) => (
                  <li key={nIdx} className="flex items-start gap-2">
                    <span className="text-indigo-600 font-bold">•</span>
                    <div>
                      <MathView content={note} inline />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Cột 2: Đồ thị hàm số */}
        {(activeTab === 'both' || activeTab === 'graph') && (
          <div>
            <FunctionGraph
              title="Đồ thị hàm số trên mặt phẳng Oxy"
              functionTex={analysis.fnTex}
              evaluate={analysis.evalFn}
              keyPoints={analysis.keyPoints}
              asymptotes={analysis.asymptotes}
              xDomain={[-5, 5]}
              yDomain={[-5, 6]}
              height={380}
            />
          </div>
        )}
      </div>
    </div>
  );
};
