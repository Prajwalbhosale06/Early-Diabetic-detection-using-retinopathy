import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  Plus, 
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { AppView } from '../types';
import { MotionButton } from './MotionButton';

interface HeaderProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  onSearch?: (term: string) => void;
  unreadCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onSearch,
  unreadCount = 2,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const getViewTitle = () => {
    switch (currentView) {
      case 'dashboard': return 'Clinical Overview';
      case 'new-screening': return 'New Retinal Screening';
      case 'patients': return 'Patient Registry';
      case 'patient-profile': return 'Patient Diagnostic Profile';
      case 'retinal-images': return 'Retinal Image Library';
      case 'image-viewer': return 'Fundus Deep Inspection';
      case 'ai-analysis': return 'AI Inference Engine';
      case 'screening-history': return 'Screening Audit Trail';
      case 'reports': return 'Diagnostic Reports';
      case 'notifications': return 'Notification Center';
      case 'settings': return 'System Settings';
      case 'help': return 'Clinical Documentation & Support';
      default: return 'RetinaAI';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header 
      id="app-header"
      className="h-16 px-6 bg-white/95 border-b border-slate-200/90 flex items-center justify-between z-20 backdrop-blur-md sticky top-0"
    >
      {/* Breadcrumb & View Title */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 text-xs text-slate-600 font-medium">
          <span>RetinaAI</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-slate-900 font-semibold">{getViewTitle()}</span>
        </div>
      </div>

      {/* Center Global Search Field */}
      <div className="hidden md:flex items-center w-80 max-w-md relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          id="header-search-input"
          type="text"
          value={searchTerm}
          onChange={handleSearchChange}
          placeholder="Search patient, ID, or scan (e.g. PAT-73819)..."
          className="w-full pl-9 pr-3.5 py-1.5 rounded-xl text-xs bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 focus:border-indigo-900 transition-all"
        />
      </div>

      {/* Right Controls: AI Engine Status + Notification + New Screening CTA */}
      <div className="flex items-center space-x-3">
        {/* Live AI Engine Status Pill */}
        <div 
          className="hidden lg:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/90 cursor-pointer hover:bg-slate-100 transition-colors"
          title="RetinaNet-V4 Deep Learning Model • 98.2% AUROC for Microaneurysms"
          onClick={() => onNavigate('ai-analysis')}
        >
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-xs font-mono font-medium text-slate-700">
            RetinaNet-v4.2.1
          </span>
          <span className="text-[10px] font-mono text-cyan-700 bg-cyan-50 px-1.5 py-0.5 rounded border border-cyan-200">
            18ms
          </span>
        </div>

        {/* Notifications Icon Button */}
        <MotionButton
          id="btn-header-notifications"
          type="button"
          onClick={() => onNavigate('notifications')}
          className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white" />
          )}
        </MotionButton>

        {/* Primary CTA */}
        {currentView !== 'new-screening' && (
          <MotionButton
            id="btn-header-new-screening"
            type="button"
            onClick={() => onNavigate('new-screening')}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-[#1E1B4B] text-white shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>New Screening</span>
          </MotionButton>
        )}
      </div>
    </header>
  );
};
