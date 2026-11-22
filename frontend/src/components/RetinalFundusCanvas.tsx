import React, { useState, useRef } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Maximize2, 
  Eye, 
  Layers, 
  Activity, 
  Flame, 
  Sparkles, 
  Crosshair,
  Sliders,
  RefreshCw,
  Moon,
  Sun,
  Ruler,
  Image as ImageIcon
} from 'lucide-react';
import { EyeSide } from '../types';
import { REAL_RETINA_IMAGES } from '../data/mockData';
import { ScanningLaserOverlay } from './ScanningLaserOverlay';

interface RetinalFundusCanvasProps {
  eye?: EyeSide;
  sampleType?: 'normal' | 'microaneurysms' | 'arteriolar_narrowing' | 'borderline';
  patientName?: string;
  imageUrl?: string;
  isScanning?: boolean;
  scanProgress?: number;
  showControls?: boolean;
  showHeatmapDefault?: boolean;
  showVesselsDefault?: boolean;
  showAnnotationsDefault?: boolean;
  interactive?: boolean;
  heightClass?: string;
  className?: string;
  isDiagnosticDimmed?: boolean;
  onToggleDimmed?: () => void;
}

export const RetinalFundusCanvas: React.FC<RetinalFundusCanvasProps> = ({
  eye = 'OD',
  sampleType = 'microaneurysms',
  patientName,
  imageUrl,
  isScanning = false,
  scanProgress = 0,
  showControls = true,
  showHeatmapDefault = false,
  showVesselsDefault = false,
  showAnnotationsDefault = true,
  interactive = true,
  heightClass = 'h-[440px]',
  className = '',
  isDiagnosticDimmed: controlledDimmed,
  onToggleDimmed,
}) => {
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Dedicated Diagnostic Dimmed / Dark Room Mode local state if not controlled
  const [localDimmed, setLocalDimmed] = useState<boolean>(false);
  const isDimmed = controlledDimmed !== undefined ? controlledDimmed : localDimmed;
  const toggleDimmed = onToggleDimmed || (() => setLocalDimmed(prev => !prev));

  const [showHeatmap, setShowHeatmap] = useState<boolean>(showHeatmapDefault);
  const [showVessels, setShowVessels] = useState<boolean>(showVesselsDefault);
  const [showAnnotations, setShowAnnotations] = useState<boolean>(showAnnotationsDefault);
  const [redFreeFilter, setRedFreeFilter] = useState<boolean>(false);
  const [contrastBoost, setContrastBoost] = useState<boolean>(false);
  const [showRealPhoto, setShowRealPhoto] = useState<boolean>(true);
  const [caliperActive, setCaliperActive] = useState<boolean>(false);

  // Measure caliper points
  const [caliperPoints, setCaliperPoints] = useState<{ p1: { x: number; y: number } | null; p2: { x: number; y: number } | null }>({
    p1: { x: 380, y: 460 },
    p2: { x: 540, y: 460 },
  });

  const containerRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive || zoom <= 1) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleReset = () => {
    setZoom(1);
    setRotation(0);
    setPan({ x: 0, y: 0 });
  };

  // Flip coordinates if OS vs OD
  // In OD (Right eye), the optic disc is on the nasal side (left side of fundus photo), macula is temporal (right).
  // In OS (Left eye), optic disc is nasal (right side), macula is temporal (left).
  const isOD = eye === 'OD';
  const discX = isOD ? 280 : 720;
  const discY = 500;
  const maculaX = isOD ? 620 : 380;
  const maculaY = 500;

  // Resolve authentic clinical retina photography URL
  const resolvedImageUrl = imageUrl || (
    eye === 'OS' 
      ? (sampleType === 'normal' ? REAL_RETINA_IMAGES.normalOS : REAL_RETINA_IMAGES.diabeticRetinopathy)
      : (sampleType === 'normal' 
          ? REAL_RETINA_IMAGES.normalOD 
          : sampleType === 'arteriolar_narrowing' 
            ? REAL_RETINA_IMAGES.normalOD 
            : REAL_RETINA_IMAGES.prediabetesMicroaneurysms)
  );

  return (
    <div 
      id="retinal-fundus-viewport"
      className={`relative w-full ${heightClass} overflow-hidden rounded-2xl select-none transition-all duration-300 ${
        isDimmed 
          ? 'bg-[#020306] border border-cyan-950/80 shadow-[inset_0_0_120px_rgba(0,0,0,0.98)]' 
          : 'bg-[#090814] border border-slate-800/80 shadow-inner'
      } ${className}`}
      ref={containerRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      style={{ cursor: caliperActive ? 'crosshair' : (zoom > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default') }}
    >
      {/* Diagnostic Dimmed Mode HUD Badge */}
      {isDimmed && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/90 border border-cyan-500/50 text-[11px] font-mono text-cyan-300 backdrop-blur-md shadow-lg pointer-events-none">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-semibold tracking-wide">DIAGNOSTIC DARK ROOM (0 LUX • MAX CONTRAST)</span>
        </div>
      )}

      {/* Retinal Canvas / SVG Simulation */}
      <div 
        className="w-full h-full flex items-center justify-center transition-transform duration-100 ease-out origin-center"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom}) rotate(${rotation}deg)`,
          filter: redFreeFilter 
            ? 'hue-rotate(95deg) saturate(2.4) contrast(1.5) brightness(0.9)' 
            : contrastBoost 
              ? 'contrast(1.4) brightness(1.05)' 
              : 'none',
        }}
      >
        <svg 
          viewBox="0 0 1000 1000" 
          className="w-full h-full max-h-[96%] max-w-[96%] drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Choroidal fundus deep radial gradient */}
            <radialGradient id="fundusBg" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#c2410c" />
              <stop offset="45%" stopColor="#9a3412" />
              <stop offset="75%" stopColor="#7c2d12" />
              <stop offset="90%" stopColor="#431407" />
              <stop offset="100%" stopColor="#1a0702" />
            </radialGradient>

            {/* Optic Disc Gradient */}
            <radialGradient id="opticDisc" cx="48%" cy="48%" r="50%">
              <stop offset="0%" stopColor="#fef08a" />
              <stop offset="45%" stopColor="#fed7aa" />
              <stop offset="85%" stopColor="#fdba74" />
              <stop offset="100%" stopColor="#ea580c" />
            </radialGradient>

            {/* Optic Cup */}
            <radialGradient id="opticCup" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="60%" stopColor="#fef3c7" />
              <stop offset="100%" stopColor="#fde68a" />
            </radialGradient>

            {/* Macula Lutea radial glow */}
            <radialGradient id="maculaGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#451a03" stopOpacity="0.9" />
              <stop offset="35%" stopColor="#78350f" stopOpacity="0.6" />
              <stop offset="70%" stopColor="#9a3412" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#9a3412" stopOpacity="0" />
            </radialGradient>

            {/* Foveal reflex sparkle */}
            <radialGradient id="foveaReflex" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fef9c3" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fef9c3" stopOpacity="0" />
            </radialGradient>

            {/* AI Grad-CAM Heatmap Gradients */}
            <radialGradient id="heatmapAnomaly1" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.85" />
              <stop offset="40%" stopColor="#f97316" stopOpacity="0.65" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="heatmapAnomaly2" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.8" />
              <stop offset="45%" stopColor="#10b981" stopOpacity="0.45" />
              <stop offset="85%" stopColor="#06b6d4" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
            </radialGradient>

            {/* Retinal aperture mask */}
            <clipPath id="retinaCircle">
              <circle cx="500" cy="500" r="475" />
            </clipPath>
          </defs>

          {/* Aperture Masked Content */}
          <g clipPath="url(#retinaCircle)">
            {/* Choroidal/RPE base */}
            <circle cx="500" cy="500" r="490" fill="url(#fundusBg)" />

            {/* Real Authentic Clinical Fundus Photography */}
            {resolvedImageUrl && (
              <image
                href={resolvedImageUrl}
                x="25"
                y="25"
                width="950"
                height="950"
                preserveAspectRatio="xMidYMid slice"
                referrerPolicy="no-referrer"
                opacity={showRealPhoto ? 1 : 0.15}
                className="transition-opacity duration-300"
              />
            )}

            {/* Micro-stippling & choroidal vessel sheen (when in synthetic mode) */}
            {!showRealPhoto && (
              <g opacity="0.18">
                <circle cx="480" cy="460" r="420" fill="none" stroke="#7c2d12" strokeWidth="2" strokeDasharray="3,12" />
                <circle cx="520" cy="540" r="380" fill="none" stroke="#431407" strokeWidth="2" strokeDasharray="5,15" />
              </g>
            )}

            {/* Macula & Fovea Centralis (synthetic overlay when photo is off) */}
            {!showRealPhoto && (
              <>
                <circle cx={maculaX} cy={maculaY} r="140" fill="url(#maculaGlow)" />
                <circle cx={maculaX} cy={maculaY} r="18" fill="#291102" />
                <circle cx={maculaX + 2} cy={maculaY - 2} r="5" fill="url(#foveaReflex)" />
              </>
            )}

            {/* Optic Disc & Physiologic Cup (synthetic overlay when photo is off) */}
            {!showRealPhoto && (
              <>
                <ellipse cx={discX} cy={discY} rx="70" ry="78" fill="url(#opticDisc)" />
                <ellipse cx={isOD ? discX + 12 : discX - 12} cy={discY} rx="30" ry="34" fill="url(#opticCup)" />
              </>
            )}

            {/* Retinal Vascular Tree (Arterioles and Venules) */}
            <g id="retinal-vessels" className="transition-opacity duration-300">
              {/* Superior Temporal Venous & Arterial Arcades */}
              <path 
                d={isOD 
                  ? "M 285 470 C 310 360, 420 220, 600 210 C 730 200, 840 270, 920 340" 
                  : "M 715 470 C 690 360, 580 220, 400 210 C 270 200, 160 270, 80 340"}
                fill="none" 
                stroke={showVessels ? "#22d3ee" : "#5b0d0d"} 
                strokeWidth={showVessels ? "11" : "9"} 
                strokeLinecap="round" 
                opacity={showVessels ? 0.95 : 0.85}
              />
              <path 
                d={isOD 
                  ? "M 275 480 C 320 380, 450 250, 620 245 C 750 240, 830 300, 890 360" 
                  : "M 725 480 C 680 380, 550 250, 380 245 C 250 240, 170 300, 110 360"}
                fill="none" 
                stroke={showVessels ? "#34d399" : "#b91c1c"} 
                strokeWidth={showVessels ? "7" : "5.5"} 
                strokeLinecap="round" 
                opacity={showVessels ? 0.95 : 0.85}
              />

              {/* Inferior Temporal Venous & Arterial Arcades */}
              <path 
                d={isOD 
                  ? "M 285 530 C 320 640, 440 760, 620 780 C 760 790, 860 730, 930 650" 
                  : "M 715 530 C 680 640, 560 760, 380 780 C 240 790, 140 730, 70 650"}
                fill="none" 
                stroke={showVessels ? "#22d3ee" : "#5b0d0d"} 
                strokeWidth={showVessels ? "10" : "8.5"} 
                strokeLinecap="round" 
                opacity={showVessels ? 0.95 : 0.85}
              />
              <path 
                d={isOD 
                  ? "M 275 520 C 330 610, 460 720, 610 740 C 740 750, 830 700, 890 630" 
                  : "M 725 520 C 670 610, 540 720, 390 740 C 260 750, 170 700, 110 630"}
                fill="none" 
                stroke={showVessels ? "#34d399" : "#b91c1c"} 
                strokeWidth={showVessels ? "6.5" : "5"} 
                strokeLinecap="round" 
                opacity={showVessels ? 0.95 : 0.85}
              />

              {/* Nasal vessels radiating inward */}
              <path 
                d={isOD 
                  ? "M 260 485 C 210 430, 160 410, 80 430" 
                  : "M 740 485 C 790 430, 840 410, 920 430"}
                fill="none" 
                stroke={showVessels ? "#34d399" : "#a81919"} 
                strokeWidth={showVessels ? "6" : "4.5"} 
                strokeLinecap="round" 
              />
              <path 
                d={isOD 
                  ? "M 260 515 C 200 570, 150 590, 90 630" 
                  : "M 740 515 C 800 570, 850 590, 910 630"}
                fill="none" 
                stroke={showVessels ? "#22d3ee" : "#5b0d0d"} 
                strokeWidth={showVessels ? "7" : "5.5"} 
                strokeLinecap="round" 
              />

              {/* Fine Perimacular Micro-capillary branches */}
              <path 
                d={isOD
                  ? "M 480 320 C 510 380, 540 430, 580 460"
                  : "M 520 320 C 490 380, 460 430, 420 460"}
                fill="none"
                stroke={showVessels ? "#38bdf8" : "#991b1b"}
                strokeWidth={showVessels ? "3.5" : "2"}
                strokeLinecap="round"
                opacity="0.8"
              />
              <path 
                d={isOD
                  ? "M 500 680 C 530 630, 560 580, 590 540"
                  : "M 500 680 C 470 630, 440 580, 410 540"}
                fill="none"
                stroke={showVessels ? "#38bdf8" : "#991b1b"}
                strokeWidth={showVessels ? "3.5" : "2"}
                strokeLinecap="round"
                opacity="0.8"
              />
            </g>

            {/* Pathological microvascular features based on sampleType */}
            {(sampleType === 'microaneurysms' || sampleType === 'borderline') && (
              <g id="microaneurysms-layer">
                {/* Microaneurysm dots (deep red punctate dots) */}
                <circle cx={isOD ? 530 : 470} cy="310" r="4.5" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1" />
                <circle cx={isOD ? 548 : 452} cy="326" r="3.8" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1" />
                <circle cx={isOD ? 610 : 390} cy="360" r="4.2" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1" />
                <circle cx={isOD ? 640 : 360} cy="660" r="4.8" fill="#450a0a" stroke="#7f1d1d" strokeWidth="1" />
              </g>
            )}

            {sampleType === 'arteriolar_narrowing' && (
              <g id="narrowing-layer">
                <circle cx={isOD ? 600 : 400} cy="640" r="4.2" fill="#450a0a" />
                <circle cx={isOD ? 630 : 370} cy="620" r="3.5" fill="#450a0a" />
              </g>
            )}

            {/* AI Grad-CAM Heatmap Layer */}
            {showHeatmap && (
              <g id="ai-grad-cam" className="transition-opacity duration-500 animate-fadeIn">
                <ellipse cx={isOD ? 560 : 440} cy="330" rx="140" ry="110" fill="url(#heatmapAnomaly1)" />
                <ellipse cx={isOD ? 620 : 380} cy="650" rx="130" ry="90" fill="url(#heatmapAnomaly2)" />
              </g>
            )}

            {/* AI Region Highlighting & Annotations */}
            {showAnnotations && (
              <g id="ai-annotations" className="transition-opacity duration-300">
                {/* Optic Disc Detection Box */}
                <rect 
                  x={discX - 85} 
                  y={discY - 95} 
                  width="170" 
                  height="190" 
                  rx="12" 
                  fill="none" 
                  stroke="#38bdf8" 
                  strokeWidth="2" 
                  strokeDasharray="6,4" 
                  opacity="0.8" 
                />
                <text x={discX - 80} y={discY - 105} fill="#38bdf8" fontSize="19" fontFamily="monospace" fontWeight="600">
                  Optic Disc (C/D: 0.38)
                </text>

                {/* Macula Center Box */}
                <circle 
                  cx={maculaX} 
                  cy={maculaY} 
                  r="60" 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="2" 
                  strokeDasharray="4,4" 
                  opacity="0.8" 
                />
                <text x={maculaX - 55} y={maculaY - 70} fill="#c4b5fd" fontSize="19" fontFamily="monospace" fontWeight="600">
                  Fovea Center
                </text>

                {/* Microaneurysm cluster callouts */}
                {sampleType === 'microaneurysms' && (
                  <g>
                    <rect 
                      x={isOD ? 510 : 420} 
                      y="290" 
                      width="120" 
                      height="85" 
                      rx="10" 
                      fill="#ef4444" 
                      fillOpacity="0.12" 
                      stroke="#f87171" 
                      strokeWidth="2.5" 
                    />
                    <line x1={isOD ? 630 : 420} y1="310" x2={isOD ? 710 : 330} y2="280" stroke="#f87171" strokeWidth="2" />
                    <rect 
                      x={isOD ? 710 : 200} 
                      y="260" 
                      width="160" 
                      height="38" 
                      rx="6" 
                      fill="#1e1b4b" 
                      stroke="#f87171" 
                      strokeWidth="1.5" 
                    />
                    <text x={isOD ? 720 : 210} y="284" fill="#fca5a5" fontSize="18" fontFamily="sans-serif" fontWeight="700">
                      ⚠ Microaneurysm (3)
                    </text>
                  </g>
                )}
              </g>
            )}

            {/* Diagnostic Digital Caliper Measurement Tool */}
            {caliperActive && (
              <g id="caliper-measurement-overlay">
                <line
                  x1={caliperPoints.p1?.x || 380}
                  y1={caliperPoints.p1?.y || 460}
                  x2={caliperPoints.p2?.x || 540}
                  y2={caliperPoints.p2?.y || 460}
                  stroke="#38bdf8"
                  strokeWidth="3.5"
                  strokeDasharray="4,3"
                />
                <circle cx={caliperPoints.p1?.x || 380} cy={caliperPoints.p1?.y || 460} r="7" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
                <circle cx={caliperPoints.p2?.x || 540} cy={caliperPoints.p2?.y || 460} r="7" fill="#38bdf8" stroke="#0369a1" strokeWidth="2.5" />
                <rect 
                  x={( (caliperPoints.p1?.x || 380) + (caliperPoints.p2?.x || 540) ) / 2 - 64} 
                  y={( (caliperPoints.p1?.y || 460) + (caliperPoints.p2?.y || 460) ) / 2 - 28} 
                  width="128" 
                  height="26" 
                  rx="6" 
                  fill="#030712" 
                  fillOpacity="0.9" 
                  stroke="#38bdf8" 
                  strokeWidth="1.5" 
                />
                <text 
                  x={( (caliperPoints.p1?.x || 380) + (caliperPoints.p2?.x || 540) ) / 2} 
                  y={( (caliperPoints.p1?.y || 460) + (caliperPoints.p2?.y || 460) ) / 2 - 11} 
                  fill="#38bdf8" 
                  fontSize="12" 
                  fontFamily="monospace" 
                  fontWeight="bold" 
                  textAnchor="middle"
                >
                  1,280 µm (0.85 DD)
                </text>
              </g>
            )}
          </g>
        </svg>
      </div>

      {/* Smooth Rhythmic AI Scanning Laser Line Overlay */}
      <ScanningLaserOverlay
        active={isScanning}
        progress={scanProgress}
        showTelemetry={false}
      />

      {/* High-Tech Retinal Overlay HUD & Badges */}
      <div className="absolute top-3.5 left-4 flex items-center space-x-2 pointer-events-none">
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold tracking-wider bg-slate-900/85 text-cyan-300 border border-cyan-500/40 backdrop-blur-md shadow-sm">
          {eye === 'OD' ? 'RIGHT EYE (OD)' : 'LEFT EYE (OS)'}
        </span>
        <span className="px-2.5 py-1 rounded-md text-xs font-mono font-semibold bg-slate-900/85 text-slate-300 border border-slate-700/60 backdrop-blur-md">
          {showRealPhoto ? 'REAL CLINICAL FUNDUS' : 'SYNTHETIC VECTOR'}
        </span>
        {redFreeFilter && (
          <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50">
            RED-FREE (540nm)
          </span>
        )}
      </div>

      {/* Patient tag & Calibration Indicator */}
      <div className="absolute top-3.5 right-4 flex items-center space-x-2 pointer-events-none">
        {patientName && (
          <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-900/85 text-slate-200 border border-slate-700/60 backdrop-blur-md">
            {patientName}
          </span>
        )}
        <span className="px-2.5 py-1 rounded-md text-xs font-mono text-cyan-400/90 bg-cyan-950/80 border border-cyan-800/60">
          MAG: {Math.round(zoom * 100)}%
        </span>
      </div>

      {/* Floating Bottom Toolbar (When controls enabled) */}
      {showControls && (
        <div 
          id="retina-toolbar"
          className="absolute bottom-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-900/92 border border-slate-700/70 shadow-2xl backdrop-blur-md text-slate-300 max-w-[95%] overflow-x-auto"
        >
          {/* Diagnostic Dark Room Mode Toggle */}
          <button
            type="button"
            id="btn-toggle-darkroom"
            title="Toggle Diagnostic Dark Room Mode (0 Lux clinical contrast)"
            onClick={toggleDimmed}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              isDimmed 
                ? 'bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.35)]' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="whitespace-nowrap font-mono">Dark Room</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1 shrink-0" />

          {/* Real Photo vs Vector Toggle */}
          <button
            type="button"
            id="btn-toggle-real-photo"
            title="Toggle Real Clinical Fundus Photography layer"
            onClick={() => setShowRealPhoto(!showRealPhoto)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              showRealPhoto 
                ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="whitespace-nowrap">Real Photo</span>
          </button>

          {/* Caliper Measure Tool */}
          <button
            type="button"
            id="btn-toggle-caliper"
            title="Toggle Digital Optical Caliper (microns / DD measurement)"
            onClick={() => setCaliperActive(!caliperActive)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              caliperActive 
                ? 'bg-sky-500/25 text-sky-300 border border-sky-400' 
                : 'hover:bg-slate-800 text-slate-400'
            }`}
          >
            <Ruler className="w-3.5 h-3.5 text-sky-400" />
            <span className="whitespace-nowrap">Caliper</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1 shrink-0" />
          {/* Zoom controls */}
          <button 
            type="button"
            id="btn-zoom-in"
            title="Zoom In" 
            onClick={() => setZoom(prev => Math.min(prev + 0.3, 3.5))}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button 
            type="button"
            id="btn-zoom-out"
            title="Zoom Out" 
            onClick={() => setZoom(prev => Math.max(prev - 0.3, 0.9))}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button 
            type="button"
            id="btn-rotate"
            title="Rotate 90°" 
            onClick={() => setRotation(prev => (prev + 90) % 360)}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button 
            type="button"
            id="btn-reset-view"
            title="Reset View" 
            onClick={handleReset}
            className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* AI Overlays Toggle */}
          <button 
            type="button"
            id="btn-toggle-heatmap"
            title="Toggle AI Grad-CAM Heatmap"
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              showHeatmap 
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 text-orange-300 border border-orange-500/40' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Heatmap</span>
          </button>

          <button 
            type="button"
            id="btn-toggle-vessels"
            title="Toggle Vascular Segmentation"
            onClick={() => setShowVessels(!showVessels)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              showVessels 
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span>Vessels</span>
          </button>

          <button 
            type="button"
            id="btn-toggle-annotations"
            title="Toggle AI Detection Boxes"
            onClick={() => setShowAnnotations(!showAnnotations)}
            className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
              showAnnotations 
                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            <Crosshair className="w-3.5 h-3.5 text-purple-400" />
            <span>Detections</span>
          </button>

          <div className="w-[1px] h-4 bg-slate-700 mx-1" />

          {/* Ophthalmology Filters */}
          <button 
            type="button"
            id="btn-toggle-redfree"
            title="Toggle Red-Free / Green Filter (Enhances microaneurysms & hemorrhages)"
            onClick={() => setRedFreeFilter(!redFreeFilter)}
            className={`px-2 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
              redFreeFilter 
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' 
                : 'hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Red-Free
          </button>

          <button 
            type="button"
            id="btn-toggle-contrast"
            title="Boost Vascular Contrast"
            onClick={() => setContrastBoost(!contrastBoost)}
            className={`p-1.5 rounded-lg hover:bg-slate-800 hover:text-cyan-300 transition-colors ${
              contrastBoost ? 'text-cyan-400' : ''
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
