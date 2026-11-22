import React from 'react';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Users, 
  Image as ImageIcon, 
  Cpu, 
  History, 
  FileText, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { AppView } from '../types';

interface SidebarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  unreadNotificationsCount?: number;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onNavigate,
  unreadNotificationsCount = 2,
  onLogout,
}) => {
  const navItems = [
    { id: 'dashboard' as AppView, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-screening' as AppView, label: 'New Screening', icon: PlusCircle, highlight: true },
    { id: 'patients' as AppView, label: 'Patients', icon: Users },
    { id: 'retinal-images' as AppView, label: 'Retinal Images', icon: ImageIcon },
    { id: 'ai-analysis' as AppView, label: 'AI Analysis', icon: Cpu, badge: 'v4.2' },
    { id: 'screening-history' as AppView, label: 'Screening History', icon: History },
    { id: 'reports' as AppView, label: 'Reports', icon: FileText },
    { id: 'notifications' as AppView, label: 'Notifications', icon: Bell, count: unreadNotificationsCount },
  ];

  const bottomNavItems = [
    { id: 'settings' as AppView, label: 'Settings', icon: Settings },
    { id: 'help' as AppView, label: 'Help & Support', icon: HelpCircle },
  ];

  return (
    <aside 
      id="main-sidebar"
      className="w-64 min-w-[256px] h-screen bg-white border-r border-slate-200/90 flex flex-col justify-between z-30 select-none shadow-[2px_0_12px_rgba(0,0,0,0.02)]"
    >
      {/* Top Brand / Logo */}
      <div className="p-5 pb-4 border-b border-slate-100">
        <div 
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={() => onNavigate('dashboard')}
          id="brand-logo-btn"
        >
          {/* Logo Aperture Icon */}
          <div className="w-10 h-10 rounded-xl bg-[#1E1B4B] flex items-center justify-center relative shadow-md shadow-indigo-950/15 group-hover:scale-105 transition-transform duration-200">
            {/* Outer Iris Ring */}
            <div className="w-7 h-7 rounded-full border border-cyan-400/50 flex items-center justify-center">
              {/* Inner Pupil / AI Core */}
              <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-tr from-cyan-400 to-teal-300 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
            </div>
            {/* Tiny AI Accent spark */}
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-white ring-1 ring-emerald-300" />
          </div>

          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-extrabold text-xl tracking-tight text-[#1E1B4B]">
                Retina<span className="text-cyan-600">AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase bg-slate-100 text-slate-600 border border-slate-200">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-slate-600 tracking-tight">
              Clinical Retinal Screening
            </p>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
        <div className="px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Clinical Workspace
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id || 
            (item.id === 'patients' && currentView === 'patient-profile') ||
            (item.id === 'retinal-images' && currentView === 'image-viewer');

          if (item.highlight) {
            return (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 my-1.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/20'
                    : 'bg-gradient-to-r from-cyan-500/10 to-teal-500/10 text-cyan-900 border border-cyan-500/25 hover:bg-cyan-500/15 hover:border-cyan-500/40'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-1 rounded-lg ${isActive ? 'bg-white/15 text-cyan-300' : 'bg-cyan-500/20 text-cyan-700'}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <span>{item.label}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                  isActive ? 'bg-cyan-400 text-[#1E1B4B]' : 'bg-cyan-600 text-white'
                }`}>
                  New
                </span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#1E1B4B] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition-colors ${
                  isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-600'
                }`} />
                <span>{item.label}</span>
              </div>

              {item.badge && (
                <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  isActive ? 'bg-white/20 text-cyan-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  {item.badge}
                </span>
              )}

              {typeof item.count === 'number' && item.count > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-xs font-bold ${
                  isActive ? 'bg-amber-400 text-slate-900' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.count}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
          Preferences
        </div>

        {bottomNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              type="button"
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-150 group ${
                isActive
                  ? 'bg-[#1E1B4B] text-white shadow-sm font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Icon className={`w-4 h-4 transition-colors ${
                isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-600'
              }`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {/* Doctor / User Profile Footer */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/70">
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-900 to-indigo-700 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                EW
              </div>
              {/* Online indicator dot */}
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="truncate">
              <div className="font-semibold text-xs text-slate-900 truncate">
                Dr. Evelyn Wilson
              </div>
              <div className="text-[11px] text-slate-600 truncate font-medium">
                Retinal Specialist
              </div>
            </div>
          </div>

          <button
            id="btn-logout"
            type="button"
            title="Sign out"
            onClick={onLogout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
