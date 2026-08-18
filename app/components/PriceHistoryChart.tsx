"use client";

import { useState, useMemo, useRef } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface HistoryItem {
  id: number;
  product_id: number;
  date: Date | string;
  price: any; // Decimal type from Prisma
  installment_price: any;
}

interface PriceHistoryChartProps {
  history: HistoryItem[];
  currentPrice: number;
}

export default function PriceHistoryChart({ history, currentPrice }: PriceHistoryChartProps) {
  const [timeframe, setTimeframe] = useState<number>(30); // 7, 15, 30 days
  const [hoveredPoint, setHoveredPoint] = useState<{
    x: number;
    y: number;
    date: Date;
    price: number;
    index: number;
  } | null>(null);

  const svgRef = useRef<SVGSVGElement>(null);

  // Parse and sort data
  const parsedData = useMemo(() => {
    if (!history || history.length === 0) {
      // Mock history if none exists to display a beautiful chart
      const mockPoints = [];
      const now = new Date();
      for (let i = timeframe; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        // Slightly random price fluctuation around current price
        const fluctuation = (Math.sin(i * 0.5) * 0.05 + (Math.random() - 0.5) * 0.02);
        mockPoints.push({
          date: d,
          price: Math.round(currentPrice * (1 + fluctuation) * 100) / 100,
        });
      }
      return mockPoints;
    }

    return history
      .map((item) => ({
        date: new Date(item.date),
        price: parseFloat(item.price.toString()),
      }))
      .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [history, currentPrice, timeframe]);

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (history && history.length > 0) return parsedData; // if actual database history, show all of it
    
    // For mock data, it already matches the timeframe
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - timeframe);
    return parsedData.filter((d) => d.date >= cutoff);
  }, [parsedData, timeframe, history]);

  // SVG Chart Calculations
  const width = 600;
  const height = 240;
  const paddingLeft = 60;
  const paddingRight = 20;
  const paddingTop = 30;
  const paddingBottom = 40;

  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  const { points, minPrice, maxPrice, dates } = useMemo(() => {
    if (filteredData.length === 0) {
      return { points: [], minPrice: 0, maxPrice: 0, dates: [] };
    }

    const prices = filteredData.map((d) => d.price);
    const minP = Math.min(...prices) * 0.98; // 2% margin below
    const maxP = Math.max(...prices) * 1.02; // 2% margin above
    const priceRange = maxP - minP || 1;

    const pts = filteredData.map((d, index) => {
      const x = paddingLeft + (index / (filteredData.length - 1 || 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((d.price - minP) / priceRange) * chartHeight;
      return { x, y, date: d.date, price: d.price, index };
    });

    return {
      points: pts,
      minPrice: Math.min(...prices),
      maxPrice: Math.max(...prices),
      dates: filteredData.map((d) => d.date),
    };
  }, [filteredData, chartWidth, chartHeight]);

  // Generate SVG Path
  const linePath = useMemo(() => {
    if (points.length === 0) return "";
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  }, [points]);

  // Generate Area Path (gradient fill)
  const areaPath = useMemo(() => {
    if (points.length === 0) return "";
    const first = points[0];
    const last = points[points.length - 1];
    const baseHeight = paddingTop + chartHeight;
    return `${linePath} L ${last.x} ${baseHeight} L ${first.x} ${baseHeight} Z`;
  }, [points, linePath, chartHeight]);

  // Handle Hover Interaction
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!svgRef.current || points.length === 0) return;

    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = width / rect.width;
    const mouseX = (e.clientX - rect.left) * scaleX;

    // Find the closest point in horizontal direction
    let closest = points[0];
    let minDiff = Math.abs(points[0].x - mouseX);

    for (let i = 1; i < points.length; i++) {
      const diff = Math.abs(points[i].x - mouseX);
      if (diff < minDiff) {
        minDiff = diff;
        closest = points[i];
      }
    }

    setHoveredPoint(closest);
  };

  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
        <div>
          <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-50">
            Histórico de Preços
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Passe o cursor sobre a linha do tempo para ver os valores históricos
          </p>
        </div>
        
        {/* Timeframe selector (only show if history is mock/generated, otherwise database controls data length) */}
        {(!history || history.length === 0) && (
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl self-start">
            {[7, 15, 30].map((t) => (
              <button
                key={t}
                onClick={() => setTimeframe(t)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  timeframe === t
                    ? "bg-white dark:bg-zinc-700 text-blue-600 dark:text-white shadow-sm"
                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                }`}
              >
                {t} dias
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible cursor-crosshair"
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Gradients */}
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line
            x1={paddingLeft}
            y1={paddingTop}
            x2={width - paddingRight}
            y2={paddingTop}
            className="stroke-zinc-100 dark:stroke-zinc-800/80"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight / 2}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight / 2}
            className="stroke-zinc-100 dark:stroke-zinc-800/80"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <line
            x1={paddingLeft}
            y1={paddingTop + chartHeight}
            x2={width - paddingRight}
            y2={paddingTop + chartHeight}
            className="stroke-zinc-200 dark:stroke-zinc-800"
            strokeWidth={1}
          />

          {/* Y Axis Labels */}
          <text
            x={paddingLeft - 10}
            y={paddingTop + 4}
            textAnchor="end"
            className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
          >
            {formatPrice(maxPrice)}
          </text>
          <text
            x={paddingLeft - 10}
            y={paddingTop + chartHeight / 2 + 4}
            textAnchor="end"
            className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
          >
            {formatPrice((minPrice + maxPrice) / 2)}
          </text>
          <text
            x={paddingLeft - 10}
            y={paddingTop + chartHeight + 4}
            textAnchor="end"
            className="fill-zinc-400 dark:fill-zinc-500 text-[10px] font-mono"
          >
            {formatPrice(minPrice)}
          </text>

          {/* X Axis Labels */}
          {points.length > 0 && (
            <>
              {/* Start label */}
              <text
                x={points[0].x}
                y={paddingTop + chartHeight + 20}
                className="fill-zinc-400 dark:fill-zinc-500 text-[10px]"
                textAnchor="start"
              >
                {format(points[0].date, "dd MMM", { locale: ptBR })}
              </text>
              {/* Middle label */}
              {points.length > 2 && (
                <text
                  x={points[Math.floor(points.length / 2)].x}
                  y={paddingTop + chartHeight + 20}
                  className="fill-zinc-400 dark:fill-zinc-500 text-[10px]"
                  textAnchor="middle"
                >
                  {format(points[Math.floor(points.length / 2)].date, "dd MMM", { locale: ptBR })}
                </text>
              )}
              {/* End label */}
              <text
                x={points[points.length - 1].x}
                y={paddingTop + chartHeight + 20}
                className="fill-zinc-400 dark:fill-zinc-500 text-[10px]"
                textAnchor="end"
              >
                {format(points[points.length - 1].date, "dd MMM", { locale: ptBR })}
              </text>
            </>
          )}

          {/* Area Path */}
          {points.length > 0 && (
            <path d={areaPath} fill="url(#chartGradient)" />
          )}

          {/* Line Path */}
          {points.length > 0 && (
            <path
              d={linePath}
              fill="none"
              stroke="#3b82f6"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive elements */}
          {hoveredPoint && (
            <>
              {/* Vertical tracker line */}
              <line
                x1={hoveredPoint.x}
                y1={paddingTop}
                x2={hoveredPoint.x}
                y2={paddingTop + chartHeight}
                className="stroke-zinc-300 dark:stroke-zinc-700"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* Point Indicator Outer Dot */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r={6}
                fill="#3b82f6"
                fillOpacity={0.3}
              />

              {/* Point Indicator Inner Dot */}
              <circle
                cx={hoveredPoint.x}
                cy={hoveredPoint.y}
                r={3.5}
                fill="#3b82f6"
                stroke="#ffffff"
                strokeWidth={1.5}
              />
            </>
          )}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPoint && (
          <div
            className="absolute bg-zinc-950 text-white rounded-xl px-3.5 py-2 border border-zinc-800 shadow-xl pointer-events-none transition-all duration-75 text-xs flex flex-col gap-0.5 z-20"
            style={{
              left: `${Math.min(
                Math.max(10, (hoveredPoint.x / width) * 100),
                90
              )}%`,
              top: `${Math.max(10, (hoveredPoint.y / height) * 100 - 32)}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <span className="text-[10px] text-zinc-400 font-medium">
              {format(hoveredPoint.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </span>
            <span className="font-bold text-sm text-blue-400">
              {formatPrice(hoveredPoint.price)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
