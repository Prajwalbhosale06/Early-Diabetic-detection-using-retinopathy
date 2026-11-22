import React, { useState } from 'react';
import { 
  Bell, 
  Check, 
  CheckCheck, 
  AlertTriangle, 
  Info, 
  Calendar, 
  Clock, 
  Trash2, 
  Filter,
  Eye,
  ArrowRight
} from 'lucide-react';
import { NotificationItem, AppView } from '../types';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onNavigate: (view: AppView) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  notifications,
  onMarkAllRead,
  onNavigate,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'alert' | 'system' | 'review'>('all');
  const [localNotifications, setLocalNotifications] = useState<NotificationItem[]>(notifications);

  const toggleRead = (id: string) => {
    setLocalNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const deleteNotification = (id: string) => {
    setLocalNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = localNotifications.filter(n => {
    if (filterType === 'all') return true;
    return n.type === filterType;
  });

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-[#1E1B4B]">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
              Clinical Notification Center
            </h1>
            <p className="text-xs text-slate-500">
              High-priority diagnostic alerts, panel review flags, and model update notifications
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 cursor-pointer"
          >
            <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setFilterType('all')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'all' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All ({localNotifications.length})
        </button>
        <button
          type="button"
          onClick={() => setFilterType('alert')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'alert' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Risk Alerts
        </button>
        <button
          type="button"
          onClick={() => setFilterType('review')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'review' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Physician Reviews
        </button>
        <button
          type="button"
          onClick={() => setFilterType('system')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer ${
            filterType === 'system' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          System Updates
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filtered.map((item) => {
          const isAlert = item.type === 'alert';
          const isReview = item.type === 'review';

          return (
            <div
              key={item.id}
              className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                !item.read
                  ? 'bg-white border-slate-300 shadow-sm'
                  : 'bg-slate-50/70 border-slate-200 opacity-80'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div className={`p-2 rounded-xl mt-0.5 shrink-0 ${
                  isAlert
                    ? 'bg-rose-50 text-rose-600'
                    : isReview
                      ? 'bg-amber-50 text-amber-600'
                      : 'bg-cyan-50 text-cyan-700'
                }`}>
                  {isAlert ? (
                    <AlertTriangle className="w-4 h-4" />
                  ) : isReview ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    <Info className="w-4 h-4" />
                  )}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`text-xs font-bold ${!item.read ? 'text-slate-900' : 'text-slate-600'}`}>
                      {item.title}
                    </h3>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-cyan-500" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.message}
                  </p>

                  <div className="flex items-center space-x-3 text-[10px] text-slate-400 pt-1 font-mono">
                    <span>{item.timestamp}</span>
                    {item.patientId && (
                      <span>• Patient: {item.patientId}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 shrink-0">
                {!item.read && (
                  <button
                    type="button"
                    onClick={() => toggleRead(item.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                    title="Mark Read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => deleteNotification(item.id)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="p-12 text-center text-xs text-slate-400 bg-white rounded-2xl border border-slate-200">
            No notifications in this category.
          </div>
        )}
      </div>
    </div>
  );
};
