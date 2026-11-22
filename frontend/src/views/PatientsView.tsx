import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  ChevronRight, 
  Eye, 
  FileText, 
  History, 
  UserCheck, 
  MoreHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { Patient, AppView } from '../types';
import { MotionButton } from '../components/MotionButton';

interface PatientsViewProps {
  patients: Patient[];
  onSelectPatient: (patientId: string) => void;
  onStartScreening: (patientId: string) => void;
  onNavigate: (view: AppView) => void;
}

export const PatientsView: React.FC<PatientsViewProps> = ({
  patients,
  onSelectPatient,
  onStartScreening,
  onNavigate,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState<'all' | 'Normal Screening' | 'Review Recommended' | 'Elevated Risk'>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredPatients = patients.filter((p) => {
    const matchesSearch = 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRisk = 
      riskFilter === 'all' || 
      p.lastScreeningResult === riskFilter ||
      (riskFilter === 'Elevated Risk' && p.lastScreeningResult === 'Further Clinical Assessment Recommended');

    return matchesSearch && matchesRisk;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            Patient Registry & Clinical Cohort
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage active ophthalmology cohorts, metabolic risk stratifications, and screening schedules
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <MotionButton
            type="button"
            onClick={() => onNavigate('new-screening')}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-sm"
          >
            <Plus className="w-4 h-4 text-cyan-400" />
            <span>Enroll / Start Screening</span>
          </MotionButton>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by patient name, ID (e.g. PAT-73819), or email..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-900/10"
          />
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-600">Risk Stratification:</span>
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as any)}
            className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-medium text-slate-800 focus:outline-none cursor-pointer"
          >
            <option value="all">All Risk Levels ({patients.length})</option>
            <option value="Normal Screening">Normal Screening</option>
            <option value="Review Recommended">Review Recommended</option>
            <option value="Elevated Risk">Elevated Risk</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold">
                <th className="pb-3 pl-2">Patient ID</th>
                <th className="pb-3">Name</th>
                <th className="pb-3">Age / Sex</th>
                <th className="pb-3">Last Screening</th>
                <th className="pb-3">Diagnostic Result</th>
                <th className="pb-3">Metabolic HbA1c</th>
                <th className="pb-3">Status</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.map((patient) => {
                const isNormal = patient.lastScreeningResult === 'Normal Screening';
                const isReview = patient.lastScreeningResult === 'Review Recommended';
                const isElevated = patient.lastScreeningResult === 'Elevated Risk' || patient.lastScreeningResult === 'Further Clinical Assessment Recommended';

                return (
                  <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 pl-2 font-mono font-medium text-slate-600">
                      {patient.id}
                    </td>
                    <td className="py-3.5">
                      <button
                        type="button"
                        onClick={() => onSelectPatient(patient.id)}
                        className="font-bold text-slate-900 hover:text-cyan-700 hover:underline text-left cursor-pointer"
                      >
                        {patient.name}
                      </button>
                      <div className="text-[11px] text-slate-400 font-normal">
                        {patient.email}
                      </div>
                    </td>
                    <td className="py-3.5 text-slate-700">
                      {patient.age}y • {patient.gender}
                    </td>
                    <td className="py-3.5 font-mono text-slate-500 text-[11px]">
                      {patient.lastScreeningDate || '—'}
                    </td>
                    <td className="py-3.5">
                      {patient.lastScreeningResult ? (
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold ${
                          isNormal
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : isReview
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                        }`}>
                          {patient.lastScreeningResult}
                        </span>
                      ) : (
                        <span className="text-slate-400">Pending initial scan</span>
                      )}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-slate-800">
                      {patient.riskFactors.recentHbA1c ? `${patient.riskFactors.recentHbA1c}%` : '—'}
                    </td>
                    <td className="py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                        {patient.status}
                      </span>
                    </td>
                    <td className="py-3.5 pr-2 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <MotionButton
                          type="button"
                          onClick={() => onSelectPatient(patient.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-indigo-50 text-[#1E1B4B] hover:bg-indigo-100 transition-colors"
                        >
                          Profile
                        </MotionButton>
                        <MotionButton
                          type="button"
                          onClick={() => onStartScreening(patient.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-50 text-cyan-800 hover:bg-cyan-100 transition-colors"
                        >
                          Screen
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
