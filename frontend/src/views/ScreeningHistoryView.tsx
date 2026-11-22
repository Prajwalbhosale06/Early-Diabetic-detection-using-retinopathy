import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Calendar, 
  Eye, 
  FileText, 
  ArrowUpDown, 
  ChevronRight,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { ScreeningRecord, AppView } from '../types';
import { MotionButton } from '../components/MotionButton';

interface ScreeningHistoryViewProps {
  screenings: ScreeningRecord[];
  onSelectScreening: (screeningId: string) => void;
  onNavigate: (view: AppView) => void;
  onGenerateReport: (screeningId: string) => void;
}

export const ScreeningHistoryView: React.FC<ScreeningHistoryViewProps> = ({
  screenings,
  onSelectScreening,
  onNavigate,
  onGenerateReport,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEye, setFilterEye] = useState<'all' | 'OD' | 'OS'>('all');
  const [filterResult, setFilterResult] = useState<'all' | 'Normal Screening' | 'Review Recommended' | 'Elevated Risk'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'Completed' | 'Pending Review' | 'Approved' | 'Flagged'>('all');

  const filteredScreenings = screenings.filter((s) => {
    const matchesSearch = 
      s.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.patientId.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesEye = filterEye === 'all' || s.eye === filterEye;
    const matchesResult = filterResult === 'all' || s.riskLevel === filterResult ||
      (filterResult === 'Elevated Risk' && s.riskLevel === 'Further Clinical Assessment Recommended');
    const matchesStatus = filterStatus === 'all' || s.status === filterStatus;

    return matchesSearch && matchesEye && matchesResult && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            Screening Audit Trail & Clinical History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Cryptographically signed longitudinal audit trail of all AI diagnostic inferences
          </p>
        </div>

        <MotionButton
          type="button"
          onClick={() => onNavigate('new-screening')}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-sm"
        >
          + New Retinal Screening
        </MotionButton>
      </div>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filter by screening ID, patient name, or MRN..."
            className="w-full pl-9 pr-3.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Eye Filter */}
          <select
            value={filterEye}
            onChange={(e) => setFilterEye(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Eyes (OD/OS)</option>
            <option value="OD">Right Eye (OD)</option>
            <option value="OS">Left Eye (OS)</option>
          </select>

          {/* Result Filter */}
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Diagnostic Outcomes</option>
            <option value="Normal Screening">Normal Screening</option>
            <option value="Review Recommended">Review Recommended</option>
            <option value="Elevated Risk">Elevated Risk</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Sign-off Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending Review">Pending Review</option>
            <option value="Flagged">Flagged</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pl-2">Screening ID</th>
                <th className="pb-3">Patient</th>
                <th className="pb-3">Timestamp</th>
                <th className="pb-3">Eye</th>
                <th className="pb-3">Risk Assessment</th>
                <th className="pb-3">Confidence</th>
                <th className="pb-3">Reviewing Clinician</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredScreenings.map((s) => {
                const isNormal = s.riskLevel === 'Normal Screening';
                const isReview = s.riskLevel === 'Review Recommended';

                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-semibold text-indigo-950">
                      {s.id}
                    </td>
                    <td className="py-3.5">
                      <div className="font-bold text-slate-900">{s.patientName}</div>
                      <div className="text-[11px] font-mono text-slate-400">{s.patientId}</div>
                    </td>
                    <td className="py-3.5 font-mono text-slate-500 text-[11px]">
                      {s.date}
                    </td>
                    <td className="py-3.5 font-mono text-slate-700">
                      <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                        {s.eye}
                      </span>
                    </td>
                    <td className="py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                        isNormal
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : isReview
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : 'bg-rose-50 text-rose-800 border border-rose-200'
                      }`}>
                        {s.riskLevel}
                      </span>
                    </td>
                    <td className="py-3.5 font-mono font-bold text-emerald-600">
                      {s.confidenceScore}%
                    </td>
                    <td className="py-3.5 text-slate-700">
                      {s.reviewer}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <MotionButton
                          type="button"
                          onClick={() => onSelectScreening(s.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#1E1B4B]"
                        >
                          Results
                        </MotionButton>
                        <MotionButton
                          type="button"
                          onClick={() => onGenerateReport(s.id)}
                          className="p-1 rounded-lg text-slate-500 hover:text-cyan-700"
                          title="Generate PDF Report"
                        >
                          <FileText className="w-3.5 h-3.5" />
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
