import React, { useState } from 'react';
import { 
  Eye, 
  Search, 
  Filter, 
  Trash2, 
  Columns, 
  Sparkles, 
  Download, 
  Calendar,
  Layers,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { RetinalImage, AppView } from '../types';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';

interface RetinalImagesLibraryViewProps {
  images: RetinalImage[];
  onNavigate: (view: AppView) => void;
  onOpenViewer: (eye: 'OD' | 'OS', patientName: string) => void;
  onAnalyzeImage: () => void;
}

export const RetinalImagesLibraryView: React.FC<RetinalImagesLibraryViewProps> = ({
  images,
  onNavigate,
  onOpenViewer,
  onAnalyzeImage,
}) => {
  const [filterEye, setFilterEye] = useState<'all' | 'OD' | 'OS'>('all');
  const [filterQuality, setFilterQuality] = useState<'all' | 'GOOD' | 'ACCEPTABLE' | 'POOR'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const notify = (msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const filteredImages = images.filter((img) => {
    const matchesEye = filterEye === 'all' || img.eye === filterEye;
    const matchesQuality = filterQuality === 'all' || img.quality === filterQuality;
    const matchesSearch = img.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || img.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesEye && matchesQuality && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            Retinal DICOM Image Archive
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Calibrated 45° macular and optic disc fundus photography library ({images.length} scans indexed)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => onNavigate('new-screening')}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] shadow-sm cursor-pointer"
          >
            + Upload New Scan
          </button>
        </div>
      </div>

      {actionNotice && (
        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 flex items-center justify-between">
          <span>{actionNotice}</span>
          <button 
            type="button" 
            onClick={() => setActionNotice(null)}
            className="font-bold text-cyan-900 ml-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[240px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patient or image ID..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10"
          />
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">Laterality:</span>
            <select
              value={filterEye}
              onChange={(e) => setFilterEye(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Eyes</option>
              <option value="OD">Right Eye (OD)</option>
              <option value="OS">Left Eye (OS)</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="font-semibold text-slate-600">Quality:</span>
            <select
              value={filterQuality}
              onChange={(e) => setFilterQuality(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Grades</option>
              <option value="GOOD">Good (90%+)</option>
              <option value="ACCEPTABLE">Acceptable (80%+)</option>
              <option value="POOR">Poor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid of Retinal Image Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {filteredImages.map((img) => {
          return (
            <div 
              key={img.id}
              className="rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              {/* Thumbnail Container */}
              <div 
                className="h-48 bg-slate-950 relative cursor-pointer overflow-hidden"
                onClick={() => onOpenViewer(img.eye, img.patientName)}
              >
                <RetinalFundusCanvas
                  eye={img.eye}
                  sampleType={img.sampleType}
                  imageUrl={img.imageUrl}
                  showControls={false}
                  heightClass="h-48"
                  interactive={false}
                />

                {/* Overlaid Badges */}
                <div className="absolute top-2.5 left-2.5 flex items-center space-x-1.5 pointer-events-none">
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-cyan-300 border border-cyan-500/40 backdrop-blur-md">
                    {img.eye}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-900/90 text-emerald-300 border border-emerald-500/40 backdrop-blur-md">
                    {img.quality} ({img.qualityScore}%)
                  </span>
                </div>

                <div className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-[#1E1B4B]/90 text-white border border-cyan-400/40 backdrop-blur-md flex items-center space-x-1">
                    <Eye className="w-3 h-3 text-cyan-400" />
                    <span>Open Viewer</span>
                  </span>
                </div>
              </div>

              {/* Image Details */}
              <div className="p-4 space-y-2 text-xs flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 truncate">
                    {img.patientName}
                  </h3>
                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                    {img.id}
                  </span>
                </div>

                <div className="text-[11px] text-slate-500 space-y-0.5">
                  <div>Date: {img.date}</div>
                  <div>Camera: {img.cameraModel}</div>
                  <div>Dilation: {img.pupilDilation}</div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center space-x-1">
                  <button
                    type="button"
                    onClick={() => onOpenViewer(img.eye, img.patientName)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-700 hover:bg-slate-100 cursor-pointer"
                    title="Deep Inspection Viewer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onNavigate('image-viewer')}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-cyan-700 hover:bg-slate-100 cursor-pointer"
                    title="Compare Baseline"
                  >
                    <Columns className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={onAnalyzeImage}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-700 hover:bg-slate-100 cursor-pointer"
                    title="Run AI Re-analysis"
                  >
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => notify(`DICOM object ${img.id} archived.`)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Archive/Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
};
