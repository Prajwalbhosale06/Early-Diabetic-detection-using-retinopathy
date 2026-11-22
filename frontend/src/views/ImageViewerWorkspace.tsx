import React, { useState, useEffect } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RefreshCw, 
  Maximize2, 
  Flame, 
  Layers, 
  Crosshair, 
  Eye, 
  Sliders, 
  Columns, 
  Download, 
  Info, 
  ChevronRight, 
  Sparkles,
  CheckCircle2,
  Calendar,
  Share2,
  Moon,
  Sun
} from 'lucide-react';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';
import { EyeSide } from '../types';
import { REAL_RETINA_IMAGES } from '../data/mockData';

interface ImageViewerWorkspaceProps {
  initialEye?: EyeSide;
  initialPatientName?: string;
}

export const ImageViewerWorkspace: React.FC<ImageViewerWorkspaceProps> = ({
  initialEye = 'OD',
  initialPatientName = 'Marcus Thorne',
}) => {
  const [selectedEye, setSelectedEye] = useState<EyeSide>(initialEye);
  const [isSplitCompare, setIsSplitCompare] = useState<boolean>(false);
  const [showMetadata, setShowMetadata] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [isDiagnosticDimmed, setIsDiagnosticDimmed] = useState<boolean>(false);

  // Keyboard shortcut: 'D' or 'd' to toggle Diagnostic Dimmed Mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'd' || e.key === 'D') && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        setIsDiagnosticDimmed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const showNotification = (msg: string) => {
    setActionFeedback(msg);
    setTimeout(() => setActionFeedback(null), 3000);
  };

  const currentImageUrl = selectedEye === 'OD' 
    ? REAL_RETINA_IMAGES.prediabetesMicroaneurysms 
    : REAL_RETINA_IMAGES.normalOS;
  const baselineImageUrl = selectedEye === 'OD' 
    ? REAL_RETINA_IMAGES.normalOD 
    : REAL_RETINA_IMAGES.normalOS;

  return (
    <div className={`space-y-6 pb-12 transition-colors duration-300 ${
      isDiagnosticDimmed 
        ? 'bg-[#06080E] -m-6 p-6 rounded-3xl min-h-[calc(100vh-6rem)]' 
        : ''
    }`}>
      {/* Workspace Header Bar */}
      <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border transition-colors duration-300 ${
        isDiagnosticDimmed 
          ? 'bg-[#0B0F17] border-slate-800 text-slate-100 shadow-2xl' 
          : 'bg-white border-slate-200/90 shadow-xs'
      }`}>
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-xl ${isDiagnosticDimmed ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/60' : 'bg-indigo-50 text-[#1E1B4B]'}`}>
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className={`text-base font-bold ${isDiagnosticDimmed ? 'text-white' : 'text-[#1E1B4B]'}`}>
                High-Resolution Retinal Image Workspace
              </h1>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                isDiagnosticDimmed 
                  ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-700/60' 
                  : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
              }`}>
                DICOM 45°
              </span>
              {isDiagnosticDimmed && (
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/90 text-amber-300 border border-amber-600/50 flex items-center space-x-1">
                  <Moon className="w-2.5 h-2.5" />
                  <span>DARK ROOM (0 LUX)</span>
                </span>
              )}
            </div>
            <p className={`text-xs ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-500'}`}>
              Examining: {initialPatientName} (PAT-73819) • Capture Date: Sep 08, 2026 09:15
            </p>
          </div>
        </div>

        {/* View Controls & Toggles */}
        <div className="flex items-center space-x-2">
          {/* Dedicated Diagnostic Dimmed / Dark Room Mode Button */}
          <button
            type="button"
            onClick={() => setIsDiagnosticDimmed(!isDiagnosticDimmed)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isDiagnosticDimmed 
                ? 'bg-cyan-500/25 text-cyan-300 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]' 
                : 'bg-slate-900 text-slate-100 border-slate-700 hover:bg-slate-800'
            }`}
            title="Toggle Diagnostic Dark Room Mode for Optimal Contrast (Press 'D')"
          >
            <Moon className="w-3.5 h-3.5 text-cyan-400" />
            <span className="whitespace-nowrap">
              {isDiagnosticDimmed ? 'Dark Room Active' : 'Dark Room Mode (D)'}
            </span>
          </button>

          {/* Laterality Toggle */}
          <div className={`flex p-1 rounded-xl border text-xs font-semibold ${
            isDiagnosticDimmed ? 'bg-[#121926] border-slate-700' : 'bg-slate-100 border-slate-200'
          }`}>
            <button
              type="button"
              onClick={() => setSelectedEye('OD')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedEye === 'OD' 
                  ? (isDiagnosticDimmed ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#1E1B4B] text-white shadow-xs') 
                  : (isDiagnosticDimmed ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Right Eye (OD)
            </button>
            <button
              type="button"
              onClick={() => setSelectedEye('OS')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                selectedEye === 'OS' 
                  ? (isDiagnosticDimmed ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-[#1E1B4B] text-white shadow-xs') 
                  : (isDiagnosticDimmed ? 'text-slate-400 hover:text-slate-200' : 'text-slate-600 hover:text-slate-900')
              }`}
            >
              Left Eye (OS)
            </button>
          </div>

          {/* Compare with Previous Screening Toggle */}
          <button
            type="button"
            onClick={() => setIsSplitCompare(!isSplitCompare)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isSplitCompare 
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-sm' 
                : isDiagnosticDimmed 
                  ? 'bg-[#121926] border-slate-700 text-slate-300 hover:bg-slate-800'
                  : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>{isSplitCompare ? 'Exit Side-by-Side' : 'Compare Baseline'}</span>
          </button>

          {/* Toggle Metadata Panel */}
          <button
            type="button"
            onClick={() => setShowMetadata(!showMetadata)}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              showMetadata 
                ? (isDiagnosticDimmed ? 'bg-cyan-950/70 border-cyan-700 text-cyan-300' : 'bg-slate-100 border-slate-300 text-slate-800') 
                : (isDiagnosticDimmed ? 'bg-[#121926] border-slate-700 text-slate-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50')
            }`}
            title="Toggle DICOM Metadata Panel"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Workspace Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Canvas Area: Single or Split-Screen */}
        <div className={`${showMetadata ? 'lg:col-span-8' : 'lg:col-span-12'} transition-all duration-300 space-y-4`}>
          {isSplitCompare ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Baseline 2025 Scan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2">
                  <span className={`font-bold ${isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-700'}`}>
                    Baseline (Sep 12, 2025)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 font-semibold">
                    Normal Screening
                  </span>
                </div>
                <RetinalFundusCanvas
                  eye={selectedEye}
                  sampleType="normal"
                  imageUrl={baselineImageUrl}
                  patientName={`${initialPatientName} (2025)`}
                  showControls={true}
                  showHeatmapDefault={false}
                  showAnnotationsDefault={false}
                  isDiagnosticDimmed={isDiagnosticDimmed}
                  onToggleDimmed={() => setIsDiagnosticDimmed(!isDiagnosticDimmed)}
                  heightClass="h-[520px]"
                />
              </div>

              {/* Current 2026 Scan */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs px-2">
                  <span className={`font-bold ${isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-700'}`}>
                    Current (Sep 08, 2026)
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-950/80 text-rose-300 border border-rose-700/60 font-semibold">
                    Elevated Risk (3 MA)
                  </span>
                </div>
                <RetinalFundusCanvas
                  eye={selectedEye}
                  sampleType="microaneurysms"
                  imageUrl={currentImageUrl}
                  patientName={`${initialPatientName} (Current)`}
                  showControls={true}
                  showHeatmapDefault={true}
                  showAnnotationsDefault={true}
                  isDiagnosticDimmed={isDiagnosticDimmed}
                  onToggleDimmed={() => setIsDiagnosticDimmed(!isDiagnosticDimmed)}
                  heightClass="h-[520px]"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <RetinalFundusCanvas
                eye={selectedEye}
                sampleType="microaneurysms"
                imageUrl={currentImageUrl}
                patientName={initialPatientName}
                showControls={true}
                showHeatmapDefault={false}
                showAnnotationsDefault={true}
                isDiagnosticDimmed={isDiagnosticDimmed}
                onToggleDimmed={() => setIsDiagnosticDimmed(!isDiagnosticDimmed)}
                heightClass="h-[580px]"
              />
            </div>
          )}

          {/* Quick Annotation Key & Legend */}
          <div className={`p-3.5 rounded-2xl border transition-colors flex flex-wrap items-center justify-between gap-3 text-xs ${
            isDiagnosticDimmed 
              ? 'bg-[#0B0F17] border-slate-800 text-slate-300' 
              : 'bg-white border-slate-200/90 shadow-xs'
          }`}>
            <div className="flex items-center space-x-4">
              <span className={`font-bold ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-800'}`}>Visual Annotations:</span>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className={isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}>Microaneurysms (3 Detected)</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" />
                <span className={isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}>Venous Arcade</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className={isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}>Arteriolar Arcade</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className={isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}>Fovea Center</span>
              </div>
            </div>

            <div className={`flex items-center space-x-2 font-mono text-[11px] ${
              isDiagnosticDimmed ? 'text-cyan-400/80' : 'text-slate-500'
            }`}>
              <span>Sensor: 3840 × 2160 RGB</span>
              <span>•</span>
              <span>Grad-CAM Lossless</span>
            </div>
          </div>
        </div>

        {/* Right Inspection & DICOM Metadata Sidebar */}
        {showMetadata && (
          <div className="lg:col-span-4 space-y-4">
            {/* Image Quality Scorecard */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              isDiagnosticDimmed 
                ? 'bg-[#0B0F17] border-slate-800 text-slate-200' 
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-xs font-bold uppercase tracking-wide ${isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-800'}`}>
                  Image Quality Grade
                </h3>
                <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                  isDiagnosticDimmed ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  GRADE: GOOD (96%)
                </span>
              </div>

              <div className="space-y-2 text-xs">
                <div className={`flex justify-between ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Focus Sharpness:</span>
                  <span className={`font-mono font-bold ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-900'}`}>97%</span>
                </div>
                <div className={`flex justify-between ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Uniform Illumination:</span>
                  <span className={`font-mono font-bold ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-900'}`}>94%</span>
                </div>
                <div className={`flex justify-between ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Arteriolar Contrast:</span>
                  <span className={`font-mono font-bold ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-900'}`}>95%</span>
                </div>
                <div className={`flex justify-between ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-600'}`}>
                  <span>Retinal Transparency:</span>
                  <span className={`font-mono font-bold ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-900'}`}>98%</span>
                </div>
              </div>
            </div>

            {/* Microvascular Morphometry Findings */}
            <div className={`p-4 rounded-2xl border space-y-3 transition-colors ${
              isDiagnosticDimmed 
                ? 'bg-[#0B0F17] border-slate-800 text-slate-200' 
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <h3 className={`text-xs font-bold uppercase tracking-wide ${isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-800'}`}>
                Quantitative Vessel Caliber
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className={`p-2.5 rounded-xl border ${
                  isDiagnosticDimmed ? 'bg-[#121926] border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between font-medium">
                    <span className={isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-600'}>Arteriolar-Venular Ratio (AVR):</span>
                    <span className="font-mono font-bold text-rose-400">0.61</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-400'}`}>
                    Reference physiological range: 0.67 – 0.72
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDiagnosticDimmed ? 'bg-[#121926] border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between font-medium">
                    <span className={isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-600'}>Vascular Tortuosity Index:</span>
                    <span className="font-mono font-bold text-amber-400">1.28 (Elevated)</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-400'}`}>
                    Mild microvascular winding in venular branches
                  </div>
                </div>

                <div className={`p-2.5 rounded-xl border ${
                  isDiagnosticDimmed ? 'bg-[#121926] border-slate-700/80' : 'bg-slate-50 border-slate-200'
                }`}>
                  <div className="flex justify-between font-medium">
                    <span className={isDiagnosticDimmed ? 'text-slate-300' : 'text-slate-600'}>FAZ Circularity Index:</span>
                    <span className="font-mono font-bold text-emerald-400">0.84 (Normal)</span>
                  </div>
                  <div className={`text-[10px] mt-0.5 ${isDiagnosticDimmed ? 'text-slate-400' : 'text-slate-400'}`}>
                    Foveal avascular zone contour intact
                  </div>
                </div>
              </div>
            </div>

            {/* DICOM Header Metadata Card */}
            <div className={`p-4 rounded-2xl border space-y-3 font-mono text-[11px] transition-colors ${
              isDiagnosticDimmed 
                ? 'bg-[#0B0F17] border-slate-800 text-slate-300' 
                : 'bg-white border-slate-200/90 shadow-xs'
            }`}>
              <h3 className={`text-xs font-bold font-sans uppercase tracking-wide ${isDiagnosticDimmed ? 'text-slate-200' : 'text-slate-800'}`}>
                DICOM Tag Attributes
              </h3>

              <div className={`space-y-1.5 divide-y ${
                isDiagnosticDimmed ? 'divide-slate-800 text-slate-300' : 'divide-slate-100 text-slate-600'
              }`}>
                <div className="flex justify-between pt-1">
                  <span>Modality:</span>
                  <span className={`font-semibold ${isDiagnosticDimmed ? 'text-slate-100' : 'text-slate-900'}`}>Ophthalmic Photography (OP)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Manufacturer:</span>
                  <span className={`font-semibold ${isDiagnosticDimmed ? 'text-slate-100' : 'text-slate-900'}`}>Topcon TRC-NW400</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Pupil Dilation:</span>
                  <span className={`font-semibold ${isDiagnosticDimmed ? 'text-slate-100' : 'text-slate-900'}`}>Non-mydriatic (4.1mm)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Exposure / Flash:</span>
                  <span className={`font-semibold ${isDiagnosticDimmed ? 'text-slate-100' : 'text-slate-900'}`}>Level 3 (Xe Flash 50 Ws)</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>SOP Instance UID:</span>
                  <span className={`font-semibold truncate max-w-[170px] ${isDiagnosticDimmed ? 'text-cyan-300' : 'text-slate-900'}`}>
                    1.2.840.10008.5.1.4.1.1.77.1.5.1
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span>Integrity SHA-256:</span>
                  <span className={`font-semibold truncate max-w-[170px] ${isDiagnosticDimmed ? 'text-cyan-300' : 'text-slate-900'}`}>
                    e89f72b0c34a129d
                  </span>
                </div>
              </div>
            </div>

            {/* Action Feedback Banner */}
            {actionFeedback && (
              <div className={`p-2.5 rounded-xl border text-xs flex items-center justify-between animate-fadeIn ${
                isDiagnosticDimmed 
                  ? 'bg-cyan-950/80 border-cyan-800 text-cyan-200' 
                  : 'bg-cyan-50 border-cyan-200 text-cyan-800'
              }`}>
                <span>{actionFeedback}</span>
                <button 
                  type="button" 
                  onClick={() => setActionFeedback(null)}
                  className="font-bold text-cyan-300 ml-2"
                >
                  ×
                </button>
              </div>
            )}

            {/* Export & Actions */}
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => showNotification('Exporting full-resolution 16-bit DICOM archive...')}
                className={`flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold border cursor-pointer shadow-xs ${
                  isDiagnosticDimmed 
                    ? 'bg-[#121926] border-slate-700 text-slate-200 hover:bg-slate-800' 
                    : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export DICOM</span>
              </button>

              <button
                type="button"
                onClick={() => showNotification('Generating anonymized research snapshot...')}
                className="flex-1 flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] cursor-pointer shadow-xs border border-indigo-700/50"
              >
                <Share2 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Share Case</span>
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
