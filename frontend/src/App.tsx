/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppView, Patient, ScreeningRecord, RetinalImage, ReportItem, NotificationItem, EyeSide } from './types';
import { 
  mockPatients, 
  mockScreenings, 
  mockRetinalImages, 
  mockReports, 
  mockNotifications 
} from './data/mockData';

// Components
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';

// Views
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { NewScreeningWorkflow } from './views/NewScreeningWorkflow';
import { PatientsView } from './views/PatientsView';
import { PatientProfileView } from './views/PatientProfileView';
import { RetinalImagesLibraryView } from './views/RetinalImagesLibraryView';
import { ImageViewerWorkspace } from './views/ImageViewerWorkspace';
import { ScreeningHistoryView } from './views/ScreeningHistoryView';
import { ReportsView } from './views/ReportsView';
import { NotificationsView } from './views/NotificationsView';
import { SettingsView } from './views/SettingsView';
import { HelpSupportView } from './views/HelpSupportView';

export default function App() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);

  // Core Navigation State
  const [currentView, setCurrentView] = useState<AppView>('dashboard');

  // Active Context & Entity Selection State
  const [selectedPatientId, setSelectedPatientId] = useState<string>('PAT-73819');
  const [selectedScreeningId, setSelectedScreeningId] = useState<string>('SCR-2026-9812');
  const [viewerEye, setViewerEye] = useState<EyeSide>('OD');
  const [viewerPatientName, setViewerPatientName] = useState<string>('Marcus Thorne');

  // Application Data State
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [screenings, setScreenings] = useState<ScreeningRecord[]>(mockScreenings);
  const [retinalImages, setRetinalImages] = useState<RetinalImage[]>(mockRetinalImages);
  const [reports, setReports] = useState<ReportItem[]>(mockReports);
  const [notifications, setNotifications] = useState<NotificationItem[]>(mockNotifications);

  // Unread Notifications Count
  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  // View Navigation Handlers
  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatientId(patientId);
    setCurrentView('patient-profile');
  };

  const handleStartScreening = (patientId?: string) => {
    if (patientId) {
      setSelectedPatientId(patientId);
    }
    setCurrentView('new-screening');
  };

  const handleSelectScreening = (screeningId: string) => {
    setSelectedScreeningId(screeningId);
    // Find patient for this screening
    const scr = screenings.find(s => s.id === screeningId);
    if (scr) {
      setViewerEye(scr.eye);
      setViewerPatientName(scr.patientName);
    }
    setCurrentView('image-viewer');
  };

  const handleOpenViewer = (eye: EyeSide, patientName: string) => {
    setViewerEye(eye);
    setViewerPatientName(patientName);
    setCurrentView('image-viewer');
  };

  const handleGenerateReport = (screeningId: string) => {
    setSelectedScreeningId(screeningId);
    setCurrentView('reports');
  };

  const handleCompleteScreening = (newRecord: ScreeningRecord) => {
    setScreenings(prev => [newRecord, ...prev]);

    // Update patient's last screening data
    setPatients(prev => prev.map(p => {
      if (p.id === newRecord.patientId) {
        return {
          ...p,
          lastScreeningDate: newRecord.date.split(' ')[0],
          lastScreeningResult: newRecord.riskLevel,
          screeningsCount: p.screeningsCount + 1,
        };
      }
      return p;
    }));

    // Add generated report
    const newReport: ReportItem = {
      id: `REP-${Date.now().toString().slice(-4)}`,
      screeningId: newRecord.id,
      patientId: newRecord.patientId,
      patientName: newRecord.patientName,
      screeningDate: newRecord.date.split(' ')[0],
      generatedDate: new Date().toISOString().split('T')[0],
      status: 'Finalized',
      riskLevel: newRecord.riskLevel,
      doctorName: 'Dr. Evelyn Wilson, MD',
    };
    setReports(prev => [newReport, ...prev]);

    // Add notification
    const newNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Screening Saved: ${newRecord.patientName}`,
      message: `AI assessment classified as ${newRecord.riskLevel} (${newRecord.confidenceScore}% confidence).`,
      timestamp: 'Just now',
      type: newRecord.riskLevel.includes('Elevated') ? 'alert' : 'system',
      read: false,
      patientId: newRecord.patientId,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Login / Logout Handlers
  if (!isAuthenticated) {
    return (
      <LoginView 
        onLogin={() => setIsAuthenticated(true)} 
        onLoginSuccess={() => setIsAuthenticated(true)} 
      />
    );
  }

  // Active Patient Object
  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];

  return (
    <div className="flex h-screen bg-[#F8FAFC] text-[#1E1B4B] font-sans antialiased overflow-hidden selection:bg-cyan-100 selection:text-cyan-900">
      {/* 1. Left Sidebar Navigation */}
      <Sidebar
        currentView={currentView}
        onNavigate={handleNavigate}
        unreadAlertsCount={unreadNotificationsCount}
        onLogout={() => setIsAuthenticated(false)}
      />

      {/* 2. Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Persistent Top Header */}
        <Header
          currentView={currentView}
          onNavigate={handleNavigate}
          unreadCount={unreadNotificationsCount}
          onStartScreening={() => handleStartScreening()}
        />

        {/* Dynamic Main Body Scroll Area */}
        <main className="flex-1 overflow-y-auto px-6 py-6 scroll-smooth">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-[1440px] mx-auto"
            >
              {currentView === 'dashboard' && (
                <DashboardView
                  patients={patients}
                  screenings={screenings}
                  onNavigate={handleNavigate}
                  onSelectPatient={handleSelectPatient}
                  onSelectScreening={handleSelectScreening}
                  onStartScreening={handleStartScreening}
                />
              )}

              {currentView === 'new-screening' && (
                <NewScreeningWorkflow
                  patients={patients}
                  initialPatientId={selectedPatientId}
                  onCompleteScreening={handleCompleteScreening}
                  onNavigate={handleNavigate}
                  onSelectPatient={handleSelectPatient}
                  onGenerateReport={handleGenerateReport}
                />
              )}

              {currentView === 'patients' && (
                <PatientsView
                  patients={patients}
                  onSelectPatient={handleSelectPatient}
                  onStartScreening={handleStartScreening}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'patient-profile' && (
                <PatientProfileView
                  patient={currentPatient}
                  screenings={screenings}
                  onBack={() => handleNavigate('patients')}
                  onStartScreening={handleStartScreening}
                  onSelectScreening={handleSelectScreening}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'retinal-images' && (
                <RetinalImagesLibraryView
                  images={retinalImages}
                  onNavigate={handleNavigate}
                  onOpenViewer={handleOpenViewer}
                  onAnalyzeImage={() => handleStartScreening(selectedPatientId)}
                />
              )}

              {currentView === 'image-viewer' && (
                <ImageViewerWorkspace
                  initialEye={viewerEye}
                  initialPatientName={viewerPatientName}
                />
              )}

              {currentView === 'screening-history' && (
                <ScreeningHistoryView
                  screenings={screenings}
                  onSelectScreening={handleSelectScreening}
                  onNavigate={handleNavigate}
                  onGenerateReport={handleGenerateReport}
                />
              )}

              {currentView === 'reports' && (
                <ReportsView
                  reports={reports}
                  screenings={screenings}
                  activeScreeningId={selectedScreeningId}
                />
              )}

              {currentView === 'notifications' && (
                <NotificationsView
                  notifications={notifications}
                  onMarkAllRead={handleMarkAllNotificationsRead}
                  onNavigate={handleNavigate}
                />
              )}

              {currentView === 'settings' && (
                <SettingsView />
              )}

              {currentView === 'help-support' && (
                <HelpSupportView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
