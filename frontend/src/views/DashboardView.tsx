import React, { useState } from 'react';
import { 
  PlusCircle, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Eye, 
  ArrowUpRight, 
  Activity, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  Server, 
  HardDrive, 
  Cpu, 
  SlidersHorizontal,
  Layers,
  ArrowRight
} from 'lucide-react';
import { ScreeningRecord, Patient, AppView } from '../types';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';
import { ModernScreeningActivityChart } from '../components/ModernScreeningActivityChart';
import { MotionButton } from '../components/MotionButton';

interface DashboardViewProps {
  onNavigate: (view: AppView) => void;
  onSelectPatient: (patientId: string) => void;
  onSelectScreening: (screeningId: string) => void;
  screenings: ScreeningRecord[];
  patients: Patient[];
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onSelectPatient,
  onSelectScreening,
  screenings,
  patients,
}) => {
  const latestScreening = screenings[0];

  // Calculated dashboard stats
  const totalScreenings = 1482;
  const todayScreenings = 28;
  const normalResults = 1084; // ~73%
  const elevatedRisk = 142; // ~9.6%
  const pendingReviews = 18;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-[#1E1B4B] via-[#282260] to-[#1E1B4B] text-white shadow-lg shadow-indigo-950/10 relative overflow-hidden">
        {/* Subtle geometric aperture background */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full border border-cyan-400/20 pointer-events-none opacity-40" />
        <div className="absolute right-16 -top-16 w-48 h-48 rounded-full border border-dashed border-teal-400/20 pointer-events-none opacity-30" />

        <div className="space-y-1.5 relative z-10">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono font-bold tracking-wider uppercase text-cyan-300 bg-cyan-950/70 px-2.5 py-0.5 rounded-md border border-cyan-500/30">
              Department of Ophthalmology
            </span>
            <span className="text-xs text-indigo-200">Room 4B • Digital Screening Unit</span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            Good morning, Dr. Prajwal
          </h1>
          <p className="text-xs text-indigo-100 max-w-xl leading-relaxed">
            AI screening engine RetinaNet-v4 is operational. 28 patient scans captured today, 3 marked with elevated microvascular remodeling risk.
          </p>
        </div>

        <div className="flex items-center space-x-3 relative z-10 shrink-0">
          <MotionButton
            id="btn-dashboard-start-screening"
            type="button"
            onClick={() => onNavigate('new-screening')}
            className="flex items-center space-x-2 px-5 py-3 rounded-xl text-xs font-bold bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
          >
            <PlusCircle className="w-4 h-4 text-slate-950" />
            <span>Start New Screening</span>
          </MotionButton>
        </div>
      </div>

      {/* 5 Statistics KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
        {/* Total Screenings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Total Screenings</span>
            <span className="p-1 rounded-md bg-slate-100 text-slate-700">
              <Activity className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {totalScreenings.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-600 font-semibold">
            <TrendingUp className="w-3 h-3" />
            <span>+12.4% vs last month</span>
          </div>
        </div>

        {/* Today's Screenings */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Today’s Screenings</span>
            <span className="p-1 rounded-md bg-cyan-50 text-cyan-800">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">
            {todayScreenings}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-cyan-800 font-medium">
            <span>On track (target: 35)</span>
          </div>
        </div>

        {/* Normal Results */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Normal Results</span>
            <span className="p-1 rounded-md bg-emerald-50 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-800 tracking-tight">
            {normalResults.toLocaleString()}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-emerald-700 font-medium">
            <span>73.1% of screenings</span>
          </div>
        </div>

        {/* Elevated Risk */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Elevated Risk</span>
            <span className="p-1 rounded-md bg-rose-50 text-rose-800">
              <AlertTriangle className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-rose-800 tracking-tight">
            {elevatedRisk}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-rose-700 font-medium">
            <span>9.6% flagged for lab work</span>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-slate-300 transition-colors col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Pending Reviews</span>
            <span className="p-1 rounded-md bg-amber-50 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-2xl font-black text-amber-800 tracking-tight">
            {pendingReviews}
          </div>
          <div className="flex items-center space-x-1 mt-1 text-[11px] text-amber-700 font-medium">
            <span>Requires sign-off</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Row: Analytics & Latest AI Analysis Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Screening Activity & Risk Breakdown */}
        <div className="lg:col-span-7 space-y-6">
          {/* Screening Activity Trends & Real-time Throughput (Modern) */}
          <ModernScreeningActivityChart />

          {/* Risk Distribution & Model Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Risk Breakdown Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Risk Distribution (Quarterly)
              </h4>
              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Normal Microvasculature</span>
                    <span className="font-semibold text-slate-900">73.1%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '73.1%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Borderline / Review Recommended</span>
                    <span className="font-semibold text-slate-900">17.3%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-amber-400 rounded-full" style={{ width: '17.3%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-600">Elevated Pre-Diabetes Risk</span>
                    <span className="font-semibold text-slate-900">9.6%</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: '9.6%' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Model Validation Card */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  AI Validation Metrics
                </h4>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 font-semibold">
                  RetinaNet-V4
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-slate-900">0%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Sensitivity
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-slate-900">0%</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Specificity
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-slate-900">0</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    AUROC
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="text-lg font-black text-cyan-700">1.4 sec</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                    Inference Time
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Latest AI Analysis Card & System Status */}
        <div className="lg:col-span-5 space-y-6">
          {/* Latest AI Analysis Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-cyan-600" />
                <h3 className="text-sm font-bold text-[#1E1B4B]">
                  Latest AI Analysis
                </h3>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                Elevated Risk
              </span>
            </div>

            {/* Interactive Preview Canvas */}
            <div className="rounded-xl overflow-hidden shadow-inner">
              <RetinalFundusCanvas
                eye={latestScreening.eye}
                sampleType="microaneurysms"
                patientName={latestScreening.patientName}
                showControls={false}
                showAnnotationsDefault={true}
                heightClass="h-[210px]"
                interactive={false}
              />
            </div>

            {/* Analysis details */}
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Patient:</span>
                <span className="font-semibold text-slate-900">{latestScreening.patientName} ({latestScreening.patientAge}y)</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Eye Examined:</span>
                <span className="font-mono font-medium text-slate-800">Right Eye (OD) • 45°</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">AI Confidence:</span>
                <span className="font-mono font-bold text-emerald-600">96.4%</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Pre-Diabetes Probability:</span>
                <span className="font-mono font-bold text-rose-600">78.5% (Elevated)</span>
              </div>
            </div>

            {/* View Full Deep Analysis Action */}
            <MotionButton
              type="button"
              id="btn-view-latest-screening"
              onClick={() => onSelectScreening(latestScreening.id)}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-xl text-xs font-semibold bg-indigo-50 text-[#1E1B4B] hover:bg-indigo-100 transition-colors cursor-pointer"
            >
              <span>Inspect Findings & Biomarkers</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </MotionButton>
          </div>

          {/* System Status Card */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center justify-between">
              <span>System Infrastructure Status</span>
              <span className="flex items-center space-x-1.5 text-emerald-600 text-[11px] font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>All Operational</span>
              </span>
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                  <span className="font-medium text-slate-700">AI Inference Cluster</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">Online (18ms)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <Server className="w-3.5 h-3.5 text-indigo-600" />
                  <span className="font-medium text-slate-700">Clinical Database</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">Synced (AES-256)</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center space-x-2">
                  <HardDrive className="w-3.5 h-3.5 text-teal-600" />
                  <span className="font-medium text-slate-700">DICOM PACS Storage</span>
                </div>
                <span className="font-mono text-slate-500 text-[11px]">2.4 TB Free (98%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Patients Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#1E1B4B]">Recent Screenings & Patients</h3>
            <p className="text-xs text-slate-500">Processed within the last 48 hours</p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('patients')}
            className="text-xs font-semibold text-cyan-700 hover:text-cyan-800 hover:underline flex items-center space-x-1 cursor-pointer"
          >
            <span>View All Patients</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pl-2">Patient ID</th>
                <th className="pb-3">Patient Name</th>
                <th className="pb-3">Age</th>
                <th className="pb-3">Eye Examined</th>
                <th className="pb-3">Diagnostic Result</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {screenings.map((screening) => {
                const isNormal = screening.riskLevel === 'Normal Screening';
                const isReview = screening.riskLevel === 'Review Recommended';
                const isElevated = screening.riskLevel === 'Elevated Risk' || screening.riskLevel === 'Further Clinical Assessment Recommended';

                return (
                  <tr key={screening.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 pl-2 font-mono font-medium text-slate-600">
                      {screening.patientId}
                    </td>
                    <td className="py-3 font-semibold text-slate-900">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(screening.patientId)}
                        className="hover:text-cyan-700 hover:underline text-left cursor-pointer"
                      >
                        {screening.patientName}
                      </button>
                    </td>
                    <td className="py-3 text-slate-600">
                      {screening.patientAge}
                    </td>
                    <td className="py-3 font-mono text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold text-[11px]">
                        {screening.eye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}
                      </span>
                    </td>
                    <td className="py-3">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isNormal
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isReview
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {screening.riskLevel}
                      </span>
                    </td>
                    <td className="py-3 text-slate-500 font-mono text-[11px]">
                      {screening.date}
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {screening.status}
                      </span>
                    </td>
                    <td className="py-3 pr-2 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <MotionButton
                          type="button"
                          onClick={() => onSelectScreening(screening.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#1E1B4B] hover:bg-indigo-100 transition-colors"
                        >
                          Results
                        </MotionButton>
                        <MotionButton
                          type="button"
                          onClick={() => onNavigate('image-viewer')}
                          className="p-1 rounded-lg text-slate-400 hover:text-cyan-700 hover:bg-slate-100 transition-colors"
                          title="Open in Retinal Workspace"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </MotionButton>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
