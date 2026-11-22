import React, { useState } from 'react';
import { 
  User, 
  Shield, 
  Bell, 
  Sliders, 
  Cpu, 
  Database, 
  Save, 
  CheckCircle2, 
  Key, 
  Download, 
  RefreshCw,
  Info
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ai' | 'profile' | 'security' | 'data'>('ai');
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(90);
  const [sensitivityMode, setSensitivityMode] = useState<'balanced' | 'high-sensitivity' | 'high-specificity'>('balanced');
  const [autoRunAnalysis, setAutoRunAnalysis] = useState<boolean>(true);
  const [enableGradCAM, setEnableGradCAM] = useState<boolean>(true);
  const [detectMicroaneurysms, setDetectMicroaneurysms] = useState<boolean>(true);
  const [detectHemorrhages, setDetectHemorrhages] = useState<boolean>(true);
  const [detectExudates, setDetectExudates] = useState<boolean>(true);
  const [measureAVRatio, setMeasureAVRatio] = useState<boolean>(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setToastMessage('Clinical algorithm configuration updated successfully.');
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-[#1E1B4B] text-white border border-cyan-400/40 shadow-2xl flex items-center space-x-3 text-xs">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            System Preferences & AI Calibration
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure machine inference parameters, DICOM pipeline, security standards, and clinician profile
          </p>
        </div>

        <button
          type="button"
          onClick={handleSaveSettings}
          className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] shadow-sm cursor-pointer"
        >
          <Save className="w-3.5 h-3.5 text-cyan-400" />
          <span>Save Changes</span>
        </button>
      </div>

      {/* Settings Tab Navigation */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'ai' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>AI Inference & Model</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'profile' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Physician Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'security' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          <span>HIPAA & Security</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('data')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all cursor-pointer ${
            activeTab === 'data' ? 'bg-[#1E1B4B] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>FHIR & Export</span>
        </button>
      </div>

      {/* TAB 1: AI INFERENCE & MODEL CONFIG */}
      {activeTab === 'ai' && (
        <div className="space-y-5">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wide">
                  RetinaNet Convolutional Model Configuration
                </h2>
                <p className="text-xs text-slate-500">
                  Current deployed weight: RetinaNet-v4.2.1-Prod (Trained on 420,000 adjudicated multi-ethnic fundus scans)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                FDA SaMD Deployed
              </span>
            </div>

            {/* Confidence Threshold Slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <div>
                  <span className="font-bold text-slate-800">Minimum Diagnostic Confidence Threshold</span>
                  <p className="text-[11px] text-slate-500">
                    Predictions below this threshold are automatically flagged for mandatory specialist consensus.
                  </p>
                </div>
                <span className="text-base font-black font-mono text-cyan-700 bg-cyan-50 px-2.5 py-1 rounded-lg border border-cyan-200">
                  {confidenceThreshold}%
                </span>
              </div>

              <input
                type="range"
                min="70"
                max="98"
                step="1"
                value={confidenceThreshold}
                onChange={(e) => setConfidenceThreshold(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#1E1B4B]"
              />
              <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                <span>70% (High Recall)</span>
                <span>85%</span>
                <span>90% (Clinical Standard)</span>
                <span>98% (High Specificity)</span>
              </div>
            </div>

            {/* Sensitivity vs Specificity Mode */}
            <div className="space-y-2 text-xs">
              <span className="font-bold text-slate-800">Screening Operating Characteristic Curve</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setSensitivityMode('balanced')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sensitivityMode === 'balanced'
                      ? 'bg-indigo-50/80 border-indigo-900/50 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">Balanced (Recommended)</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sensitivity: 94.2% • Specificity: 95.8%. Optimal for general population pre-diabetes triage.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSensitivityMode('high-sensitivity')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sensitivityMode === 'high-sensitivity'
                      ? 'bg-indigo-50/80 border-indigo-900/50 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">High Sensitivity Mode</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sensitivity: 98.4% • Specificity: 89.1%. Minimizes false negatives in high-risk metabolic cohorts.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setSensitivityMode('high-specificity')}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                    sensitivityMode === 'high-specificity'
                      ? 'bg-indigo-50/80 border-indigo-900/50 shadow-xs'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="font-bold text-slate-900">High Specificity Mode</div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Sensitivity: 89.6% • Specificity: 99.1%. Reduces clinical re-testing burden.
                  </div>
                </button>
              </div>
            </div>

            {/* Feature Detection Sub-modules */}
            <div className="space-y-3 text-xs pt-2 border-t border-slate-100">
              <span className="font-bold text-slate-800 uppercase tracking-wide">
                Active Feature Extraction Sub-Models
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-800">Microaneurysm Spotter</div>
                    <div className="text-[11px] text-slate-500">Detects focal saccular capillary outpouches</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={detectMicroaneurysms}
                    onChange={(e) => setDetectMicroaneurysms(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-800">AV Ratio & Caliber Narrowing</div>
                    <div className="text-[11px] text-slate-500">Automated arteriovenous caliber ratio calculation</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={measureAVRatio}
                    onChange={(e) => setMeasureAVRatio(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-800">Grad-CAM Saliency Maps</div>
                    <div className="text-[11px] text-slate-500">Generate explainable attention heatmaps for clinicians</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableGradCAM}
                    onChange={(e) => setEnableGradCAM(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 rounded"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                  <div>
                    <div className="font-semibold text-slate-800">Instant Automated Screening</div>
                    <div className="text-[11px] text-slate-500">Trigger neural pipeline immediately after upload</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRunAnalysis}
                    onChange={(e) => setAutoRunAnalysis(e.target.checked)}
                    className="w-4 h-4 text-indigo-900 rounded"
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PHYSICIAN PROFILE */}
      {activeTab === 'profile' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5 text-xs">
          <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wide">
            Attending Clinician Credentials
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Full Name & Honorific</label>
              <input
                type="text"
                defaultValue="Dr. Evelyn Wilson, MD"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Medical License Number</label>
              <input
                type="text"
                defaultValue="CA-MD-892104"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Hospital / Clinic Affiliation</label>
              <input
                type="text"
                defaultValue="St. Jude Endocrine & Ophthalmic Center"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Clinical Email</label>
              <input
                type="email"
                defaultValue="evelyn.wilson@retinaai.health"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY & HIPAA */}
      {activeTab === 'security' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wide">
            Security, Cryptography & Compliance
          </h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Hardware Security Module (HSM) Signing</div>
                <div className="text-[11px] text-slate-500">Every report is sealed with SHA-256 digital signature</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ACTIVE
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Session Idle Inactivity Timeout</div>
                <div className="text-[11px] text-slate-500">Auto-lock terminal screen after 15 minutes of inactivity</div>
              </div>
              <span className="font-mono font-semibold text-slate-700">15 min</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-900">Patient Identifier De-Identification</div>
                <div className="text-[11px] text-slate-500">Sanitize PHI tags before sending telemetry to model monitoring</div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ENABLED
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FHIR & DATA EXPORT */}
      {activeTab === 'data' && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4 text-xs">
          <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wide">
            Interoperability & Data Portability
          </h2>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">HL7 FHIR R4 Bundle Export</div>
                <div className="text-[11px] text-slate-500">Export diagnostic observations into standard Epic/Cerner FHIR format</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToastMessage('Exporting HL7 FHIR R4 JSON bundle...');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] cursor-pointer"
              >
                Export FHIR
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <div className="font-bold text-slate-900">Full Audit Log (CSV)</div>
                <div className="text-[11px] text-slate-500">Download complete HIPAA access trail and inference records</div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setToastMessage('Downloading HIPAA compliant CSV audit trail...');
                  setTimeout(() => setToastMessage(null), 3000);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Download CSV
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
