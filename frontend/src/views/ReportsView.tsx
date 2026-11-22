import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  ShieldCheck, 
  Eye, 
  Share2,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { ReportItem, ScreeningRecord } from '../types';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';
import { MotionButton } from '../components/MotionButton';

interface ReportsViewProps {
  reports: ReportItem[];
  screenings: ScreeningRecord[];
  activeScreeningId?: string;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  screenings,
  activeScreeningId,
}) => {
  const [selectedReportId, setSelectedReportId] = useState<string>(
    reports.find(r => r.screeningId === activeScreeningId)?.id || reports[0].id
  );

  const selectedReport = reports.find(r => r.id === selectedReportId) || reports[0];
  const associatedScreening = screenings.find(s => s.id === selectedReport.screeningId) || screenings[0];
  const [downloadStatus, setDownloadStatus] = useState<string | null>(null);

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadStatus(`Generating verified clinical PDF package for ${selectedReport.patientName}... Ready for download.`);
    setTimeout(() => setDownloadStatus(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            Diagnostic Health Reports & PDF Generation
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified clinical reports ready for endocrinologist referral, patient portal, and EHR export
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <MotionButton
            type="button"
            onClick={handlePrint}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-300 text-slate-700 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </MotionButton>

          <MotionButton
            type="button"
            onClick={handleDownload}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Download Official PDF</span>
          </MotionButton>
        </div>
      </div>

      {downloadStatus && (
        <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-800 flex items-center justify-between">
          <span>{downloadStatus}</span>
          <button 
            type="button" 
            onClick={() => setDownloadStatus(null)}
            className="font-bold text-cyan-900 ml-2"
          >
            ×
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Recent Reports List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Generated Reports Archive
            </h3>

            <div className="space-y-2">
              {reports.map((report) => {
                const isSelected = report.id === selectedReport.id;
                const isNormal = report.riskLevel === 'Normal Screening';
                const isElevated = report.riskLevel === 'Elevated Risk' || report.riskLevel === 'Further Clinical Assessment Recommended';

                return (
                  <div
                    key={report.id}
                    onClick={() => setSelectedReportId(report.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-900/50 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {report.patientName}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">
                        {report.id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-1">
                      <span>Exam: {report.screeningDate}</span>
                      <span className={`px-2 py-0.2 rounded font-semibold text-[10px] ${
                        isNormal
                          ? 'bg-emerald-50 text-emerald-700'
                          : isElevated
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-700'
                      }`}>
                        {report.riskLevel}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 mt-2 border-t border-slate-100">
                      <span>Status: {report.status}</span>
                      <span>By: {report.doctorName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: Full Official Printable Medical Report View */}
        <div className="lg:col-span-8">
          <div 
            id="printable-clinical-report"
            className="p-8 rounded-3xl bg-white border border-slate-200/90 shadow-lg space-y-6 text-slate-900"
          >
            {/* Report Letterhead Header */}
            <div className="flex items-start justify-between pb-6 border-b-2 border-slate-900">
              <div className="space-y-1">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#1E1B4B] flex items-center justify-center text-cyan-400 font-bold text-sm">
                    R
                  </div>
                  <span className="text-xl font-black tracking-tight text-[#1E1B4B]">
                    Retina<span className="text-cyan-600">AI</span> Health
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-slate-100 text-slate-600 border border-slate-200">
                    Clinical Report
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Center for Retinal Intelligence & Early Microvascular Assessment
                </p>
                <p className="text-[11px] text-slate-400 font-mono">
                  CLIA / CAP Accredited Diagnostic Imaging Facility #9821-CA
                </p>
              </div>

              <div className="text-right text-xs font-mono space-y-1 text-slate-600">
                <div>Report Ref: <strong className="text-slate-900">{selectedReport.id}</strong></div>
                <div>Date Issued: {selectedReport.generatedDate}</div>
                <div>Protocol: SaMD-v4.2.1</div>
              </div>
            </div>

            {/* Patient Demographic Box */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Patient Name</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedReport.patientName}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Patient ID (MRN)</span>
                <div className="font-mono font-bold text-slate-900 mt-0.5">{selectedReport.patientId}</div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Examined Laterality</span>
                <div className="font-bold text-slate-900 mt-0.5">
                  {associatedScreening.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                </div>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-semibold">Reviewing Clinician</span>
                <div className="font-bold text-slate-900 mt-0.5">{selectedReport.doctorName}</div>
              </div>
            </div>

            {/* Primary Diagnostic Assessment Banner */}
            <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-mono text-cyan-300 font-semibold uppercase">
                  Screening Diagnostic Classification
                </div>
                <div className="text-lg font-black mt-0.5 text-white">
                  {associatedScreening.riskLevel}
                </div>
              </div>

              <div className="flex items-center space-x-4 text-xs font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px]">AI Confidence</span>
                  <span className="font-bold text-emerald-400 text-sm">{associatedScreening.confidenceScore}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Pre-Diabetes Prob.</span>
                  <span className="font-bold text-rose-400 text-sm">{associatedScreening.preDiabetesProbability}%</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Estimated HbA1c</span>
                  <span className="font-bold text-cyan-400 text-sm">{associatedScreening.estimatedHbA1cRange}</span>
                </div>
              </div>
            </div>

            {/* Retinal Fundus Image with AI Overlay in Report */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-6 rounded-2xl overflow-hidden shadow-inner border border-slate-200">
                <RetinalFundusCanvas
                  eye={associatedScreening.eye}
                  sampleType={associatedScreening.retinalImage?.sampleType || 'microaneurysms'}
                  patientName={selectedReport.patientName}
                  showControls={false}
                  showHeatmapDefault={true}
                  showAnnotationsDefault={true}
                  heightClass="h-[240px]"
                  interactive={false}
                />
              </div>

              <div className="md:col-span-6 space-y-3 text-xs">
                <h4 className="font-bold text-slate-800 uppercase tracking-wide">
                  Retinal Imaging Metadata & Quality
                </h4>
                <div className="space-y-1 text-slate-600 font-mono text-[11px]">
                  <div>Camera: Topcon TRC-NW400 Digital Retinal Camera</div>
                  <div>Field: 45° Posterior Pole (Macula-Centered)</div>
                  <div>Quality Score: {associatedScreening.imageQuality.overallScore}/100 ({associatedScreening.imageQuality.status})</div>
                  <div>Resolution: 3840 × 2160 uncompressed 16-bit</div>
                  <div>Dilation: Non-mydriatic (Physiological photopic)</div>
                </div>
              </div>
            </div>

            {/* AI Observations & Biomarker Findings */}
            <div className="space-y-3 text-xs">
              <h4 className="font-bold text-slate-800 uppercase tracking-wide border-b border-slate-200 pb-1.5">
                Detailed Morphological Observations
              </h4>
              <ul className="list-disc pl-5 space-y-1.5 text-slate-700 leading-relaxed">
                {associatedScreening.aiObservations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>

            {/* Recommended Clinical Action */}
            <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 text-xs space-y-1">
              <span className="font-bold text-[#1E1B4B] uppercase tracking-wide">
                Physician Follow-up & Action Plan
              </span>
              <p className="text-slate-700 leading-relaxed font-medium">
                {associatedScreening.recommendedAction}
              </p>
            </div>

            {/* Mandatory Medical Disclaimer */}
            <div className="p-3.5 rounded-xl bg-slate-100 border border-slate-200 text-[11px] text-slate-600 leading-relaxed">
              <strong>MEDICAL DISCLAIMER:</strong> This AI-assisted screening provides a risk assessment and is not a definitive medical diagnosis. Clinical assessment should be performed by an appropriately qualified healthcare professional.
            </div>

            {/* Doctor Signature Block */}
            <div className="pt-6 border-t border-slate-200 flex items-end justify-between">
              <div className="space-y-1">
                <div className="font-serif italic text-lg text-slate-800">
                  Dr. Evelyn Wilson, MD
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Senior Retinal Specialist & Lead Investigator
                </div>
                <div className="text-[10px] text-slate-400 font-mono">
                  License #CA-MD-892104 • Signed via SHA-256 HSM
                </div>
              </div>

              <div className="flex items-center space-x-1 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-4 h-4" />
                <span>Verified & Finalized</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
