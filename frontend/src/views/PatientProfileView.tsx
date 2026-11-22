import React, { useState } from 'react';
import { 
  ArrowLeft, 
  PlusCircle, 
  Calendar, 
  Phone, 
  Mail, 
  Activity, 
  FileText, 
  Clock, 
  Eye, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  Save,
  FileCheck
} from 'lucide-react';
import { Patient, ScreeningRecord, AppView } from '../types';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';
import { MotionButton } from '../components/MotionButton';

interface PatientProfileViewProps {
  patient: Patient;
  screenings: ScreeningRecord[];
  onBack: () => void;
  onStartScreening: (patientId: string) => void;
  onSelectScreening: (screeningId: string) => void;
  onNavigate: (view: AppView) => void;
}

export const PatientProfileView: React.FC<PatientProfileViewProps> = ({
  patient,
  screenings,
  onBack,
  onStartScreening,
  onSelectScreening,
  onNavigate,
}) => {
  const patientScreenings = screenings.filter((s) => s.patientId === patient.id);
  const latestScreening = patientScreenings[0];
  const [notes, setNotes] = useState(patient.notes);
  const [savedNotesToast, setSavedNotesToast] = useState(false);

  const handleSaveNotes = () => {
    setSavedNotesToast(true);
    setTimeout(() => setSavedNotesToast(false), 3000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {savedNotesToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-[#1E1B4B] text-white border border-cyan-400/40 shadow-2xl flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">Clinical chart notes updated in electronic record.</span>
        </div>
      )}

      {/* Top Navigation & Profile Header */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Patient Registry</span>
          </button>

          <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-slate-100 text-slate-700">
            MRN: {patient.id}
          </span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1E1B4B] to-[#312E81] text-white flex items-center justify-center font-bold text-xl shadow-md">
              {patient.name.split(' ').map(n => n[0]).join('')}
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-2xl font-black text-[#1E1B4B] tracking-tight">
                  {patient.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  {patient.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {patient.age} years old • Biological {patient.gender} • DOB: {patient.dob}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <MotionButton
              type="button"
              id="btn-profile-start-screening"
              onClick={() => onStartScreening(patient.id)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/15"
            >
              <PlusCircle className="w-4 h-4 text-cyan-400" />
              <span>Start New Screening</span>
            </MotionButton>
          </div>
        </div>

        {/* Demographics & Contact Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-100 text-xs">
          <div className="flex items-center space-x-2 text-slate-600">
            <Phone className="w-3.5 h-3.5 text-slate-400" />
            <span>{patient.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600 truncate">
            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{patient.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Activity className="w-3.5 h-3.5 text-slate-400" />
            <span>BMI: <strong className="text-slate-800">{patient.riskFactors.bmi}</strong></span>
          </div>
          <div className="flex items-center space-x-2 text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Last Exam: <strong className="text-slate-800">{patient.lastScreeningDate || 'N/A'}</strong></span>
          </div>
        </div>
      </div>

      {/* Main 2-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Risk Trajectory & Retinal History */}
        <div className="lg:col-span-7 space-y-6">
          {/* Risk Trajectory Timeline */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E1B4B]">
                Metabolic & Retinal Risk Trajectory (2024–2026)
              </h3>
              <span className="text-[11px] font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Active Progression Alert
              </span>
            </div>

            {/* Visual Timeline Stepper */}
            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {/* Year 2026 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-rose-500 ring-4 ring-rose-100" />
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Sep 08, 2026 (Current Screening)</span>
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-rose-100 text-rose-800">
                      Elevated Risk (78.5%)
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    3 microaneurysms detected in superotemporal arcade. Estimated HbA1c: 6.1%–6.4%. Laboratory confirmation recommended.
                  </p>
                </div>
              </div>

              {/* Year 2025 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Sep 12, 2025 (Annual Physical)</span>
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-emerald-100 text-emerald-800">
                      Normal Screening
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Bilateral fundus photographs clear. No focal lesions. Standard 12-month recall.
                  </p>
                </div>
              </div>

              {/* Year 2024 */}
              <div className="relative">
                <div className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-slate-400 ring-4 ring-slate-100" />
                <div className="p-3.5 rounded-xl bg-white border border-slate-200 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">Aug 20, 2024 (Initial Baseline)</span>
                    <span className="px-2 py-0.5 rounded font-semibold text-[10px] bg-slate-100 text-slate-700">
                      Baseline Healthy
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600">
                    Baseline established with Topcon digital retinal camera. Fasting glucose: 98 mg/dL.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Historical Retinal Images Carousel/Cards */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#1E1B4B]">
              Fundus Image Archive
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div 
                className="rounded-xl overflow-hidden border border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer group"
                onClick={() => onNavigate('image-viewer')}
              >
                <div className="h-40 bg-slate-950">
                  <RetinalFundusCanvas
                    eye="OD"
                    sampleType="microaneurysms"
                    showControls={false}
                    heightClass="h-40"
                    interactive={false}
                  />
                </div>
                <div className="p-3 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900">Right Eye (OD) • 2026</span>
                    <span className="text-rose-600 text-[10px] font-bold">Elevated</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Quality: 96% • Topcon TRC-NW400</span>
                </div>
              </div>

              <div 
                className="rounded-xl overflow-hidden border border-slate-200 hover:border-cyan-500 transition-colors cursor-pointer group"
                onClick={() => onNavigate('image-viewer')}
              >
                <div className="h-40 bg-slate-950">
                  <RetinalFundusCanvas
                    eye="OS"
                    sampleType="normal"
                    showControls={false}
                    heightClass="h-40"
                    interactive={false}
                  />
                </div>
                <div className="p-3 bg-slate-50 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-900">Left Eye (OS) • 2025</span>
                    <span className="text-emerald-600 text-[10px] font-bold">Normal</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Quality: 98% • Topcon TRC-NW400</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Diagnostic Summary & Notes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest Screening Card */}
          {latestScreening && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1E1B4B]">
                  Most Recent AI Findings
                </h3>
                <span className="text-xs font-mono font-bold text-slate-500">
                  {latestScreening.date}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Risk Assessment:</span>
                  <span className="font-bold text-rose-600">{latestScreening.riskLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pre-Diabetes Probability:</span>
                  <span className="font-mono font-bold text-slate-900">{latestScreening.preDiabetesProbability}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Estimated HbA1c Range:</span>
                  <span className="font-mono font-bold text-slate-900">{latestScreening.estimatedHbA1cRange}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Model Confidence:</span>
                  <span className="font-mono font-bold text-emerald-600">{latestScreening.confidenceScore}%</span>
                </div>
              </div>

              <MotionButton
                type="button"
                onClick={() => onSelectScreening(latestScreening.id)}
                className="w-full flex items-center justify-center space-x-1.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-[#1E1B4B] hover:bg-indigo-100 transition-colors"
              >
                <span>View Full Screening Report</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </MotionButton>
            </div>
          )}

          {/* Clinical Doctor Notes Editor */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1E1B4B]">
                Physician Chart Notes
              </h3>
              <span className="text-[11px] text-slate-400">Dr. Evelyn Wilson, MD</span>
            </div>

            <textarea
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 font-medium"
              placeholder="Add clinical observations, consultation recommendations, or follow-up schedule..."
            />

            <div className="flex justify-end">
              <MotionButton
                type="button"
                onClick={handleSaveNotes}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-xs"
              >
                <Save className="w-3.5 h-3.5 text-cyan-400" />
                <span>Save Notes</span>
              </MotionButton>
            </div>
          </div>

          {/* Connected Reports */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wide">
              Official Diagnostic Reports
            </h4>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-cyan-700" />
                <div>
                  <div className="font-semibold text-slate-900">Report_SCR-2026-9812.pdf</div>
                  <div className="text-[10px] text-slate-500">Draft • Generated Today</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('reports')}
                className="text-xs font-bold text-cyan-700 hover:text-cyan-800 hover:underline cursor-pointer"
              >
                Open →
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
