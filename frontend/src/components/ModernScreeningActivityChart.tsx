import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip,
  ReferenceLine
} from 'recharts';
import { 
  TrendingUp, 
  Activity, 
  Calendar, 
  Percent, 
  Layers, 
  Sparkles,
  ShieldCheck,
  Clock,
  Eye,
  ArrowUpRight
} from 'lucide-react';
import { MotionButton } from './MotionButton';

export type TimeframeOption = 'weekly' | 'monthly';
export type ChartDisplayMode = 'stacked' | 'stream' | 'total';
export type RiskTierHighlight = 'all' | 'normal' | 'review' | 'elevated';

interface ActivityPoint {
  key: string;
  label: string;
  sublabel: string;
  total: number;
  normal: number;
  review: number;
  elevated: number;
  isCurrent?: boolean;
}

const WEEKLY_DATA: ActivityPoint[] = [
  { key: 'mon', label: 'Mon', sublabel: 'Sep 02', total: 34, normal: 27, review: 4, elevated: 3 },
  { key: 'tue', label: 'Tue', sublabel: 'Sep 03', total: 42, normal: 34, review: 4, elevated: 4 },
  { key: 'wed', label: 'Wed', sublabel: 'Sep 04', total: 39, normal: 30, review: 5, elevated: 4 },
  { key: 'thu', label: 'Thu', sublabel: 'Sep 05', total: 49, normal: 39, review: 5, elevated: 5 },
  { key: 'fri', label: 'Fri', sublabel: 'Sep 06', total: 46, normal: 36, review: 6, elevated: 4 },
  { key: 'sat', label: 'Sat', sublabel: 'Sep 07', total: 24, normal: 20, review: 2, elevated: 2 },
  { key: 'today', label: 'Today', sublabel: 'Sep 08', total: 28, normal: 21, review: 4, elevated: 3, isCurrent: true },
];

const MONTHLY_DATA: ActivityPoint[] = [
  { key: 'apr', label: 'Apr', sublabel: '2026', total: 220, normal: 172, review: 28, elevated: 20 },
  { key: 'may', label: 'May', sublabel: '2026', total: 254, normal: 198, review: 32, elevated: 24 },
  { key: 'jun', label: 'Jun', sublabel: '2026', total: 278, normal: 212, review: 39, elevated: 27 },
  { key: 'jul', label: 'Jul', sublabel: '2026', total: 295, normal: 228, review: 37, elevated: 30 },
  { key: 'aug', label: 'Aug', sublabel: '2026', total: 318, normal: 242, review: 44, elevated: 32 },
  { key: 'sep', label: 'Sep', sublabel: 'MTD', total: 146, normal: 111, review: 20, elevated: 15, isCurrent: true },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: ActivityPoint;
  }>;
  label?: string;
}

const CustomChartTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint: ActivityPoint = payload[0].payload;
  const normalPct = ((dataPoint.normal / dataPoint.total) * 100).toFixed(0);
  const reviewPct = ((dataPoint.review / dataPoint.total) * 100).toFixed(0);
  const elevatedPct = ((dataPoint.elevated / dataPoint.total) * 100).toFixed(0);

  return (
    <div className="p-3.5 rounded-2xl bg-slate-950/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-xl min-w-[240px] text-xs transition-all animate-in fade-in zoom-in-95 duration-150">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2 mb-2.5">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-slate-100 text-sm">{dataPoint.label}</span>
          <span className="text-[11px] font-mono text-slate-400">({dataPoint.sublabel})</span>
        </div>
        {dataPoint.isCurrent && (
          <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>LIVE</span>
          </span>
        )}
      </div>

      {/* Total Scans Banner */}
      <div className="flex items-baseline justify-between mb-3 px-2 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800">
        <span className="text-slate-400 font-medium">Total Retina Scans:</span>
        <span className="font-mono text-sm font-black text-cyan-300">{dataPoint.total} patients</span>
      </div>

      {/* Breakdown Rows */}
      <div className="space-y-1.5 font-mono text-[11px]">
        {/* Normal */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-teal-950/30 border border-teal-900/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-teal-400" />
            <span className="text-teal-300 font-sans font-medium">Normal Baseline</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-teal-200">{dataPoint.normal}</span>
            <span className="text-slate-400 text-[10px]">({normalPct}%)</span>
          </div>
        </div>

        {/* Needs Review */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-amber-950/30 border border-amber-900/40">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-sans font-medium">Needs Review</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-amber-200">{dataPoint.review}</span>
            <span className="text-slate-400 text-[10px]">({reviewPct}%)</span>
          </div>
        </div>

        {/* Elevated Risk */}
        <div className="flex items-center justify-between py-1 px-2 rounded-lg bg-rose-950/40 border border-rose-900/50">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="text-rose-300 font-sans font-medium">Elevated Risk (Pre-DM)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-rose-200">{dataPoint.elevated}</span>
            <span className="text-rose-300 font-bold text-[10px]">({elevatedPct}%)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ModernScreeningActivityChartProps {
  initialTimeframe?: TimeframeOption;
  onTimeframeChange?: (timeframe: TimeframeOption) => void;
  className?: string;
}

export const ModernScreeningActivityChart: React.FC<ModernScreeningActivityChartProps> = ({
  initialTimeframe = 'weekly',
  onTimeframeChange,
  className = '',
}) => {
  const [timeframe, setTimeframe] = useState<TimeframeOption>(initialTimeframe);
  const [displayMode, setDisplayMode] = useState<ChartDisplayMode>('stacked');
  const [highlightTier, setHighlightTier] = useState<RiskTierHighlight>('all');

  const handleTimeframeChange = (tf: TimeframeOption) => {
    setTimeframe(tf);
    if (onTimeframeChange) {
      onTimeframeChange(tf);
    }
  };

  const data = timeframe === 'weekly' ? WEEKLY_DATA : MONTHLY_DATA;

  // Aggregate statistics
  const totalScans = data.reduce((acc, curr) => acc + curr.total, 0);
  const totalNormal = data.reduce((acc, curr) => acc + curr.normal, 0);
  const totalReview = data.reduce((acc, curr) => acc + curr.review, 0);
  const totalElevated = data.reduce((acc, curr) => acc + curr.elevated, 0);

  const normalPct = ((totalNormal / totalScans) * 100).toFixed(1);
  const reviewPct = ((totalReview / totalScans) * 100).toFixed(1);
  const elevatedPct = ((totalElevated / totalScans) * 100).toFixed(1);

  // Peak activity calculation
  const peakItem = [...data].sort((a, b) => b.total - a.total)[0];

  return (
    <div 
      id="screening-activity-chart-container"
      className={`p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 transition-all ${className}`}
    >
      {/* Header Bar with Modern Control Group */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700 border border-teal-100">
              <Activity className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-[#1E1B4B] tracking-tight">
              Screening Activity & Area Trajectory
            </h3>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>RECHARTS LIVE</span>
            </span>
          </div>
          <p className="text-xs text-slate-500">
            {timeframe === 'weekly' 
              ? 'Smooth multi-tier volumetric throughput over the past 7 days' 
              : 'Institutional longitudinal screening growth and diagnostic risk curves'}
          </p>
        </div>

        {/* Action Controls: Tactile Button Animations */}
        <div className="flex items-center space-x-2 shrink-0">
          {/* Display Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <MotionButton
              type="button"
              id="btn-mode-stacked"
              onClick={() => setDisplayMode('stacked')}
              title="Stacked Area Breakdown"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${
                displayMode === 'stacked' 
                  ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Stacked</span>
            </MotionButton>
            <MotionButton
              type="button"
              id="btn-mode-total"
              onClick={() => setDisplayMode('total')}
              title="Total Volume Stream"
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg ${
                displayMode === 'total' 
                  ? 'bg-white text-slate-900 shadow-xs font-semibold' 
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Total Curve</span>
            </MotionButton>
          </div>

          {/* Timeframe Switcher (Weekly / Monthly) */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80 text-xs">
            <MotionButton
              type="button"
              id="btn-timeframe-weekly"
              onClick={() => handleTimeframeChange('weekly')}
              className={`px-3 py-1 rounded-lg font-medium ${
                timeframe === 'weekly' 
                  ? 'bg-[#1E1B4B] text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Weekly
            </MotionButton>
            <MotionButton
              type="button"
              id="btn-timeframe-monthly"
              onClick={() => handleTimeframeChange('monthly')}
              className={`px-3 py-1 rounded-lg font-medium ${
                timeframe === 'monthly' 
                  ? 'bg-[#1E1B4B] text-white shadow-xs font-bold' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Monthly
            </MotionButton>
          </div>
        </div>
      </div>

      {/* KPI Micro-Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50/80 border border-slate-200/80">
        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500">Period Total Scans</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-extrabold text-slate-900 tracking-tight">{totalScans}</span>
            <span className="text-[10px] font-semibold text-emerald-600 flex items-center">
              <TrendingUp className="w-2.5 h-2.5 mr-0.5" />
              +8.4%
            </span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500">Normal Baseline</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-extrabold text-teal-700 tracking-tight">{totalNormal}</span>
            <span className="text-[10px] font-mono text-slate-400">({normalPct}%)</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500">Needs Review</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-extrabold text-amber-700 tracking-tight">{totalReview}</span>
            <span className="text-[10px] font-mono text-slate-400">({reviewPct}%)</span>
          </div>
        </div>

        <div className="space-y-0.5">
          <span className="text-[11px] font-medium text-slate-500">Elevated Pre-DM</span>
          <div className="flex items-baseline space-x-1.5">
            <span className="text-base font-extrabold text-rose-600 tracking-tight">{totalElevated}</span>
            <span className="text-[10px] font-mono text-rose-500 font-bold">({elevatedPct}%)</span>
          </div>
        </div>
      </div>

      {/* Modern Interactive Recharts Area Surface */}
      <div className="w-full h-56 pt-2 select-none">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              {/* Total Gradient */}
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0284c7" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#0284c7" stopOpacity={0.0} />
              </linearGradient>

              {/* Normal Baseline Teal Gradient */}
              <linearGradient id="colorNormal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0d9488" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#0d9488" stopOpacity={0.03} />
              </linearGradient>

              {/* Review Amber Gradient */}
              <linearGradient id="colorReview" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.03} />
              </linearGradient>

              {/* Elevated Crimson Gradient */}
              <linearGradient id="colorElevated" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.65} />
                <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05} />
              </linearGradient>
            </defs>

            {/* Subtle Gridlines */}
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false} 
              stroke="#e2e8f0" 
              opacity={0.7} 
            />

            {/* X-Axis */}
            <XAxis 
              dataKey="label" 
              tickLine={false} 
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
              dy={6}
            />

            {/* Y-Axis */}
            <YAxis 
              tickLine={false} 
              axisLine={false} 
              tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }}
              dx={-4}
            />

            {/* Interactive Custom Tooltip */}
            <Tooltip 
              content={<CustomChartTooltip />} 
              cursor={{ stroke: '#38bdf8', strokeWidth: 1.5, strokeDasharray: '4 4' }} 
            />

            {/* Peak Activity Reference Line */}
            {peakItem && (
              <ReferenceLine 
                x={peakItem.label} 
                stroke="#64748b" 
                strokeDasharray="2 2" 
                strokeOpacity={0.5} 
              />
            )}

            {displayMode === 'stacked' ? (
              <>
                {/* Elevated Risk Area (Top Stack or highlighted) */}
                {(highlightTier === 'all' || highlightTier === 'elevated') && (
                  <Area
                    type="monotone"
                    dataKey="elevated"
                    name="Elevated Risk"
                    stackId="1"
                    stroke="#f43f5e"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorElevated)"
                    activeDot={{ r: 5, fill: '#f43f5e', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Needs Review Area (Middle Stack) */}
                {(highlightTier === 'all' || highlightTier === 'review') && (
                  <Area
                    type="monotone"
                    dataKey="review"
                    name="Needs Review"
                    stackId="1"
                    stroke="#f59e0b"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorReview)"
                    activeDot={{ r: 5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}

                {/* Normal Baseline Area (Bottom Stack) */}
                {(highlightTier === 'all' || highlightTier === 'normal') && (
                  <Area
                    type="monotone"
                    dataKey="normal"
                    name="Normal Baseline"
                    stackId="1"
                    stroke="#0d9488"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorNormal)"
                    activeDot={{ r: 5, fill: '#0d9488', stroke: '#ffffff', strokeWidth: 2 }}
                  />
                )}
              </>
            ) : (
              /* Total Cumulative Volume Curve */
              <Area
                type="monotone"
                dataKey="total"
                name="Total Volume"
                stroke="#0284c7"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTotal)"
                activeDot={{ r: 6, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2.5 }}
              />
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Interactive Legend & Risk Filter Strip with Tactile Button Micro-Depress */}
      <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <span className="text-slate-400 font-medium text-[11px] hidden sm:inline">Highlight Tier:</span>

          {/* Filter: All */}
          <MotionButton
            type="button"
            onClick={() => setHighlightTier('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
              highlightTier === 'all' 
                ? 'bg-slate-900 text-white shadow-xs' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
            }`}
          >
            All Curves
          </MotionButton>

          {/* Filter: Normal */}
          <MotionButton
            type="button"
            onClick={() => setHighlightTier(highlightTier === 'normal' ? 'all' : 'normal')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              highlightTier === 'normal' 
                ? 'bg-teal-600 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-teal-50 hover:text-teal-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
            <span>Normal ({totalNormal})</span>
          </MotionButton>

          {/* Filter: Review */}
          <MotionButton
            type="button"
            onClick={() => setHighlightTier(highlightTier === 'review' ? 'all' : 'review')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              highlightTier === 'review' 
                ? 'bg-amber-400 text-slate-950 shadow-xs font-bold' 
                : 'text-slate-600 hover:bg-amber-50 hover:text-amber-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span>Review ({totalReview})</span>
          </MotionButton>

          {/* Filter: Elevated */}
          <MotionButton
            type="button"
            onClick={() => setHighlightTier(highlightTier === 'elevated' ? 'all' : 'elevated')}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
              highlightTier === 'elevated' 
                ? 'bg-rose-500 text-white shadow-xs' 
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-800'
            }`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Elevated ({totalElevated})</span>
          </MotionButton>
        </div>

        {/* Telemetry Indicator */}
        <div className="flex items-center space-x-3 font-mono text-[11px] text-slate-400">
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>Peak: {peakItem?.label} ({peakItem?.total})</span>
          </span>
          <span>•</span>
          <span className="flex items-center space-x-1 text-emerald-600 font-semibold">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>99.2% Quality Grade</span>
          </span>
        </div>
      </div>
    </div>
  );
};
