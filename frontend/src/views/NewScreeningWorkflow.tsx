import React, { useState, useEffect } from 'react';

import { 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  UploadCloud, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  RefreshCw, 
  Eye, 
  Camera, 
  User, 
  Info, 
  FileCheck, 
  Download, 
  Share2, 
  ChevronRight,
  Printer,
  Calendar,
  Layers,
  Flame,
  Activity,
  Maximize2
} from 'lucide-react';
import { 
  Patient, 
  EyeSide, 
  QualityMetrics, 
  ScreeningRecord, 
  RetinalImage, 
  RiskLevel,
  AppView 
} from '../types';
import { RetinalFundusCanvas } from '../components/RetinalFundusCanvas';
import { sampleScansForUpload } from '../data/mockData';
import { MotionButton } from '../components/MotionButton';
import { ScanningLaserOverlay } from '../components/ScanningLaserOverlay';
import { DirectFundusCameraCapture } from '../components/DirectFundusCameraCapture';

interface NewScreeningWorkflowProps {
  patients: Patient[];
  onCompleteScreening: (record: ScreeningRecord) => void;
  onNavigate: (view: AppView) => void;
  onSelectPatient: (patientId: string) => void;
  onGenerateReport: (screeningId: string) => void;
  initialPatientId?: string;
}

export const NewScreeningWorkflow: React.FC<NewScreeningWorkflowProps> = ({
  patients,
  onCompleteScreening,
  onNavigate,
  onSelectPatient,
  onGenerateReport,
  initialPatientId,
}) => {
  const [currentStep, setCurrentStep] = useState<number>(1);

  const [prediction, setPrediction] = useState<string | null>(null);
  const [predictionClassId, setPredictionClassId] = useState<number | null>(null);
  const [predictionConfidence, setPredictionConfidence] = useState<number | null>(null);
  const [predictionLoading, setPredictionLoading] = useState<boolean>(false);
  const [predictionError, setPredictionError] = useState<string | null>(null);

  // Step 1: Patient Selection & Details
  const defaultPatient = patients.find(p => p.id === initialPatientId) || patients[1]; // Marcus Thorne
  const [selectedPatientId, setSelectedPatientId] = useState<string>(defaultPatient.id);
  const [patientName, setPatientName] = useState<string>(defaultPatient.name);
  const [patientAge, setPatientAge] = useState<number>(defaultPatient.age);
  const [patientDob, setPatientDob] = useState<string>(defaultPatient.dob);
  const [patientGender, setPatientGender] = useState<'Female' | 'Male' | 'Other'>(defaultPatient.gender);
  const [patientContact, setPatientContact] = useState<string>(defaultPatient.phone);
  const [bmi, setBmi] = useState<number>(defaultPatient.riskFactors.bmi);
  const [hypertension, setHypertension] = useState<boolean>(defaultPatient.riskFactors.hypertension);
  const [familyHistory, setFamilyHistory] = useState<boolean>(defaultPatient.riskFactors.familyHistoryDiabetes);
  const [clinicalNotes, setClinicalNotes] = useState<string>(defaultPatient.notes);

  // Step 2: Retinal Image Upload & Direct Camera Capture
  const [selectedEye, setSelectedEye] = useState<EyeSide>('OD');
  const [acquisitionMode, setAcquisitionMode] = useState<'camera' | 'upload'>('camera');
  const [uploadedFile, setUploadedFile] = useState<any>(null);
  const [uploadStatus, setUploadStatus] = useState<'empty' | 'uploading' | 'complete'>('complete');
  const [uploadProgress, setUploadProgress] = useState<number>(100);
  const [cameraActive, setCameraActive] = useState<boolean>(false);

  // Step 3: Image Validation Quality Metrics
  const qualityMetrics: QualityMetrics = {
    overallScore: uploadedFile?.qualityScore || 96,
    focus: uploadedFile?.metrics?.sharpness || 97,
    brightness: uploadedFile?.metrics?.illumination || 94,
    contrast: 95,
    retinalVisibility: uploadedFile?.metrics?.mediaClarity || 98,
    fieldOfView: '45° Macula-Centered',
    resolution: uploadedFile?.deviceSource ? '1920 × 1080 (Optical Sensor Frame)' : '3840 × 2160',
    status: (uploadedFile?.qualityScore || 96) >= 85 ? 'GOOD' : 'ACCEPTABLE',
  };

  // Step 4: AI Analysis Stages
  const [analysisProgress, setAnalysisProgress] = useState<number>(0);
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);
  const [analysisComplete, setAnalysisComplete] = useState<boolean>(false);

  const stages = [
    { title: 'Image Preprocessing & Artifact Removal', desc: 'Calibrating illumination, chromatic balance and noise reduction' },
    { title: 'Retinal Structure & Landmark Segmentation', desc: 'Isolating optic disc, cup margin, and macula foveal avascular zone' },
    { title: 'Microvascular Feature & Biomarker Detection', desc: 'Classifying caliber narrowing, tortuosity index, and microaneurysms' },
    { title: 'Pre-Diabetes Risk Machine Inference', desc: 'Correlating microvascular morphology with metabolic markers' },
    { title: 'Diagnostic Report Compilation', desc: 'Synthesizing clinical findings and generating recommendation' },
  ];

  // Step 5: Results state
  const [doctorApproval, setDoctorApproval] = useState<'pending' | 'approved' | 'flagged'>('pending');
  const [doctorNotes, setDoctorNotes] = useState<string>(
    'Concur with AI microaneurysm detection in superotemporal arcade. Ordering confirmatory laboratory HbA1c and advising 6-month ophthalmological recall.'
  );
  const [showToast, setShowToast] = useState<string | null>(null);
  const [scanIteration, setScanIteration] = useState<number>(0);

  const handleRestartAnalysis = () => {
    setAnalysisProgress(0);
    setActiveStageIndex(0);
    setAnalysisComplete(false);
    setScanIteration(prev => prev + 1);
  };

  // Switch patient handler
  const handleSelectPatientChange = (patientId: string) => {
    const p = patients.find(pat => pat.id === patientId);
    if (p) {
      setSelectedPatientId(p.id);
      setPatientName(p.name);
      setPatientAge(p.age);
      setPatientDob(p.dob);
      setPatientGender(p.gender);
      setPatientContact(p.phone);
      setBmi(p.riskFactors.bmi);
      setHypertension(p.riskFactors.hypertension);
      setFamilyHistory(p.riskFactors.familyHistoryDiabetes);
      setClinicalNotes(p.notes);
    }
  };

  // Run real AI analysis when stepping into step 4
  useEffect(() => {
    if (currentStep !== 4) return;

    let cancelled = false;
    let progressTimer: ReturnType<typeof setInterval> | null = null;

    setAnalysisProgress(0);
    setActiveStageIndex(0);
    setAnalysisComplete(false);
    setPrediction(null);
    setPredictionClassId(null);
    setPredictionConfidence(null);
    setPredictionError(null);

    const runPrediction = async () => {
      if (!uploadedFile?.file) {
        setPredictionError('Please upload or capture a retinal image before starting AI analysis.');
        setAnalysisComplete(false);
        return;
      }

      setPredictionLoading(true);

      let progress = 0;

      progressTimer = setInterval(() => {
        if (cancelled) return;

        progress = Math.min(progress + 2, 90);

        setAnalysisProgress(progress);

        if (progress < 20) setActiveStageIndex(0);
        else if (progress < 45) setActiveStageIndex(1);
        else if (progress < 70) setActiveStageIndex(2);
        else if (progress < 90) setActiveStageIndex(3);
        else setActiveStageIndex(4);
      }, 100);

      try {
        const formData = new FormData();
        formData.append('image', uploadedFile.file);

        const response = await fetch(
          'http://127.0.0.1:5001/predict',
          {
            method: 'POST',
            body: formData,
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Prediction failed.');
        }

        if (cancelled) return;

        setPrediction(data.prediction);
        setPredictionClassId(data.class_id);
        setPredictionConfidence(data.confidence);

        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }

        setAnalysisProgress(100);
        setActiveStageIndex(4);
        setAnalysisComplete(true);

      } catch (error) {
        if (cancelled) return;

        if (progressTimer) {
          clearInterval(progressTimer);
          progressTimer = null;
        }

        setPredictionError(
          error instanceof Error
            ? error.message
            : 'Unable to connect to the Flask prediction server.'
        );

        setAnalysisComplete(false);

      } finally {
        if (!cancelled) {
          setPredictionLoading(false);
        }
      }
    };

    runPrediction();

    return () => {
      cancelled = true;

      if (progressTimer) {
        clearInterval(progressTimer);
      }
    };
  }, [currentStep, scanIteration, uploadedFile]);

  // Demo sample loader
  const handleSimulateUpload = (sample: any) => {
    setUploadedFile(null);
    setUploadStatus('uploading');
    setUploadProgress(15);
    setPrediction(null);
    setPredictionClassId(null);
    setPredictionConfidence(null);
    setPredictionError(null);

    setTimeout(() => setUploadProgress(50), 250);
    setTimeout(() => setUploadProgress(85), 500);
    setTimeout(() => {
      setUploadedFile(sample);
      setSelectedEye(sample.eye);
      setUploadProgress(100);
      setUploadStatus('complete');
    }, 750);
  };

  // Convert a camera data URL into a File for the Flask API
  const dataUrlToFile = async (dataUrl: string, fileName: string): Promise<File> => {
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    return new File(
      [blob],
      fileName,
      { type: blob.type || 'image/png' }
    );
  };

  // Direct Camera & Mobile Fundus Capture Handler
  const handleCameraCaptureComplete = async (capturedData: {
    dataUrl: string;
    qualityScore: number;
    metrics: {
      illumination: number;
      sharpness: number;
      alignment: number;
      mediaClarity: number;
    };
    deviceSource: string;
  }) => {
    try {
      const fileName = `Direct_Fundus_Capture_${selectedEye}_${Date.now().toString().slice(-4)}.png`;
      const file = await dataUrlToFile(capturedData.dataUrl, fileName);

      const newCapturedFile = {
        id: `CAM-${Date.now().toString().slice(-6)}`,
      name: `Direct_Fundus_Capture_${selectedEye}_${Date.now().toString().slice(-4)}.png`,
      size: '4.2 MB (Sensor Native 1080p)',
      eye: selectedEye,
      patientName: patientName,
      sampleType: 'microaneurysms',
      qualityScore: capturedData.qualityScore,
      tags: ['LIVE_CAPTURE', selectedEye, '45°_APERTURE', 'CONFOCAL_SLO'],
      imageUrl: capturedData.dataUrl,
      deviceSource: capturedData.deviceSource,
        metrics: capturedData.metrics,
        file,
      };

      setUploadedFile(newCapturedFile);
      setPrediction(null);
      setPredictionClassId(null);
      setPredictionConfidence(null);
      setPredictionError(null);
      setUploadStatus('complete');
      setUploadProgress(100);
      setShowToast(`Fundus frame successfully acquired via ${capturedData.deviceSource} (Quality: ${capturedData.qualityScore}%)`);
      setCurrentStep(3);
    } catch (error) {
      setPredictionError(
        error instanceof Error
          ? error.message
          : 'Unable to prepare the captured image for AI analysis.'
      );
    }
  };

  const stepsList = [
    { num: 1, label: 'Patient Information' },
    { num: 2, label: 'Image Upload' },
    { num: 3, label: 'Quality Assessment' },
    { num: 4, label: 'AI Analysis' },
    { num: 5, label: 'Screening Results' },
  ];

  const handleSaveResult = () => {
    if (!prediction || predictionConfidence === null) {
      setShowToast('No AI prediction is available. Run the model analysis first.');
      setTimeout(() => setShowToast(null), 4000);
      return;
    }

    const newRecord: ScreeningRecord = {
      id: `SCR-${Date.now().toString().slice(-4)}`,
      patientId: selectedPatientId,
      patientName: patientName,
      patientAge: patientAge,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
      eye: selectedEye,
      riskLevel: predictionClassId === 0
        ? 'Normal Screening'
        : predictionClassId === 1 || predictionClassId === 2
          ? 'Review Recommended'
          : 'Elevated Risk',
      confidenceScore: predictionConfidence ?? 0,
      preDiabetesProbability: 0,
      estimatedHbA1cRange: 'Not estimated by ResNet50',
      detectedFeatures: [],
      aiObservations: [
        `ResNet50 prediction: ${prediction || 'Unavailable'}.`,
        `Model confidence: ${predictionConfidence !== null ? `${predictionConfidence.toFixed(2)}%` : 'Unavailable'}.`,
        'No separate retinal biomarker detection was performed by the classification API.',
      ],
      recommendedAction: 'Review the AI model prediction with a qualified eye-care professional before making any clinical decision.',
      imageQuality: qualityMetrics,
      reviewer: 'Dr. Evelyn Wilson, MD',
      status: doctorApproval === 'approved' ? 'Approved' : doctorApproval === 'flagged' ? 'Flagged' : 'Completed',
      retinalImage: {
        id: `IMG-${Date.now().toString().slice(-4)}`,
        patientId: selectedPatientId,
        patientName: patientName,
        eye: selectedEye,
        date: new Date().toISOString().replace('T', ' ').slice(0, 16),
        quality: qualityMetrics.status,
        qualityScore: qualityMetrics.overallScore,
        resolution: qualityMetrics.resolution,
        cameraModel: 'Topcon TRC-NW400 Digital Retinal Camera',
        pupilDilation: 'Non-mydriatic',
        imageUrl: uploadedFile?.imageUrl || uploadedFile?.id || 'fundus-sample-1',
        thumbnailUrl: uploadedFile?.imageUrl || uploadedFile?.id || 'fundus-sample-1',
        sampleType: uploadedFile?.sampleType || 'microaneurysms',
      },
      previousScreeningComparison: {
        previousDate: 'N/A',
        previousRisk: prediction || 'N/A',
        vesselChangeRate: 'N/A',
        progressionSummary: 'No longitudinal comparison is provided by the ResNet50 classification API.',
      },
    };

    onCompleteScreening(newRecord);
    setShowToast('Screening record saved and synced to patient electronic health record.');
    setTimeout(() => {
      setShowToast(null);
    }, 4000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast feedback */}
      {showToast && (
        <div className="fixed top-20 right-8 z-50 p-4 rounded-xl bg-[#1E1B4B] text-white border border-cyan-400/40 shadow-2xl flex items-center space-x-3 text-xs animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
          <span className="font-semibold">{showToast}</span>
        </div>
      )}

      {/* Top Header & Step Breadcrumbs */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase bg-cyan-50 text-cyan-800 border border-cyan-200">
                Step {currentStep} of 5
              </span>
              <span className="text-xs text-slate-500 font-medium">Protocol: FDA-SaMD-FD45</span>
            </div>
            <h1 className="text-xl font-black text-[#1E1B4B] tracking-tight mt-1">
              AI-Assisted Retinal Screening Workflow
            </h1>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="text-slate-500">Patient:</span>
            <span className="font-bold text-slate-800">{patientName}</span>
            <span className="text-slate-400">({selectedPatientId})</span>
          </div>
        </div>

        {/* 5-Step Progress Stepper Bar */}
        <div className="grid grid-cols-5 gap-2 pt-2 border-t border-slate-100">
          {stepsList.map((step) => {
            const isDone = currentStep > step.num;
            const isCurrent = currentStep === step.num;
            return (
              <div 
                key={step.num}
                onClick={() => {
                  if (step.num < currentStep) setCurrentStep(step.num);
                }}
                className={`flex items-center space-x-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-indigo-50/70 border-indigo-900/40 text-[#1E1B4B] shadow-xs'
                    : isDone
                      ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                      : 'bg-slate-50/40 border-slate-200/60 text-slate-400 opacity-70'
                }`}
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  isCurrent
                    ? 'bg-[#1E1B4B] text-white'
                    : isDone
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-600'
                }`}>
                  {isDone ? <Check className="w-3.5 h-3.5" /> : step.num}
                </div>
                <div className="truncate hidden sm:block">
                  <div className="text-[11px] font-bold truncate leading-tight">
                    {step.label}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {isDone ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* STEP 1: PATIENT INFORMATION */}
      {currentStep === 1 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B]">
                1. Patient Clinical Profile
              </h2>
              <p className="text-xs text-slate-500">
                Select an existing patient from the registry or verify diagnostic demographics
              </p>
            </div>

            {/* Patient Selector Dropdown */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-600">Switch Patient:</label>
              <select
                id="select-existing-patient"
                value={selectedPatientId}
                onChange={(e) => handleSelectPatientChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-50 border border-slate-300 text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-900/10 cursor-pointer"
              >
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.id}) — {p.age}y
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs">
            {/* Patient ID */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Patient Medical Record Number (MRN)
              </label>
              <input
                type="text"
                value={selectedPatientId}
                readOnly
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-mono font-medium"
              />
            </div>

            {/* Patient Full Name */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Full Legal Name
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 focus:ring-2 focus:ring-indigo-900/10 font-medium"
              />
            </div>

            {/* Date of Birth & Age */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={patientDob}
                  onChange={(e) => setPatientDob(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  Age
                </label>
                <input
                  type="number"
                  value={patientAge}
                  onChange={(e) => setPatientAge(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 font-medium"
                />
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Biological Sex
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
              >
                <option value="Female">Female</option>
                <option value="Male">Male</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Contact Phone */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={patientContact}
                onChange={(e) => setPatientContact(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
              />
            </div>

            {/* Body Mass Index */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1.5">
                Body Mass Index (BMI)
              </label>
              <input
                type="number"
                step="0.1"
                value={bmi}
                onChange={(e) => setBmi(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900"
              />
            </div>
          </div>

          {/* Pre-Diabetes Risk Factors Checklist */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
              Metabolic & Cardiovascular Risk Factors
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              <label className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyHistory}
                  onChange={(e) => setFamilyHistory(e.target.checked)}
                  className="rounded text-indigo-900 focus:ring-indigo-900 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Family History of Diabetes (1st Degree)</span>
              </label>

              <label className="flex items-center space-x-2.5 p-2.5 rounded-lg bg-white border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={hypertension}
                  onChange={(e) => setHypertension(e.target.checked)}
                  className="rounded text-indigo-900 focus:ring-indigo-900 w-4 h-4"
                />
                <span className="font-medium text-slate-700">Hypertension / Antihypertensive Rx</span>
              </label>

              <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                <span className="font-medium text-slate-700">Fasting Glucose:</span>
                <span className="font-mono font-bold text-slate-900">116 mg/dL</span>
              </div>
            </div>
          </div>

          {/* Clinical Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Clinical Indications & Symptoms
            </label>
            <textarea
              rows={3}
              value={clinicalNotes}
              onChange={(e) => setClinicalNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs text-slate-900 focus:ring-2 focus:ring-indigo-900/10"
              placeholder="e.g. Patient referred for annual metabolic surveillance. Subjective reports of night driving glare..."
            />
          </div>

          {/* Step 1 Actions */}
          <div className="flex justify-end pt-3">
            <MotionButton
              type="button"
              id="btn-step1-continue"
              onClick={() => setCurrentStep(2)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/15"
            >
              <span>Proceed to Image Upload</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </MotionButton>
          </div>
        </div>
      )}

      {/* STEP 2: RETINAL IMAGE UPLOAD */}
      {currentStep === 2 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B]">
                2. Fundus Image Acquisition
              </h2>
              <p className="text-xs text-slate-500">
                Directly capture via smartphone ophthalmoscope adapter / USB fundus camera, or upload a retinal image
              </p>
            </div>

            {/* Left Eye vs Right Eye Selector */}
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-600">Laterality:</span>
              <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200">
                <MotionButton
                  type="button"
                  id="btn-select-eye-od"
                  onClick={() => setSelectedEye('OD')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    selectedEye === 'OD'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Right Eye (OD)
                </MotionButton>
                <MotionButton
                  type="button"
                  id="btn-select-eye-os"
                  onClick={() => setSelectedEye('OS')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                    selectedEye === 'OS'
                      ? 'bg-[#1E1B4B] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Left Eye (OS)
                </MotionButton>
              </div>
            </div>
          </div>

          {/* Acquisition Mode Switcher */}
          <div className="flex p-1.5 rounded-xl bg-slate-100/90 border border-slate-200/80 max-w-xl">
            <button
              type="button"
              id="tab-mode-camera"
              onClick={() => setAcquisitionMode('camera')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                acquisitionMode === 'camera'
                  ? 'bg-white text-[#1E1B4B] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <div className="relative flex items-center">
                <Camera className="w-4 h-4 text-cyan-600" />
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span>Direct Fundus Camera & Mobile Capture</span>
            </button>

            <button
              type="button"
              id="tab-mode-upload"
              onClick={() => setAcquisitionMode('upload')}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg text-xs font-bold transition-all ${
                acquisitionMode === 'upload'
                  ? 'bg-white text-[#1E1B4B] shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-4 h-4 text-slate-500" />
              <span>Retinal Image Upload & Demo Scans</span>
            </button>
          </div>

          {/* MODE 1: Direct Fundus Camera & Mobile Capture Viewfinder */}
          {acquisitionMode === 'camera' && (
            <div className="space-y-4">
              <DirectFundusCameraCapture
                selectedEye={selectedEye}
                onCaptureComplete={handleCameraCaptureComplete}
              />
            </div>
          )}

          {/* MODE 2: File Upload & Quick Clinical Test Scans */}
          {acquisitionMode === 'upload' && (
            <div className="space-y-6">
              {/* Preset Clinical Test Samples for Quick Testing */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Quick Test Scans (demo UI samples):
                  </span>
                  <span className="text-[11px] text-cyan-800 font-medium">
                    Use Browse Files for real model prediction
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {sampleScansForUpload.map((sample) => {
                    const isSelected = uploadedFile?.id === sample.id;
                    return (
                      <div
                        key={sample.id}
                        onClick={() => handleSimulateUpload(sample)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-50/80 border-indigo-900/50 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs font-semibold">
                            <span className="text-slate-800 truncate">{sample.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100 text-slate-600">
                              {sample.eye}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Patient: {sample.patientName} • {sample.size}
                          </p>
                        </div>

                        <div className="flex items-center space-x-1 mt-2">
                          {sample.tags.map((t, idx) => (
                            <span key={idx} className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-cyan-500/80 rounded-2xl p-8 flex flex-col items-center justify-center text-center bg-slate-50/50 transition-colors group">
                <div className="w-14 h-14 rounded-2xl bg-cyan-50 text-cyan-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <UploadCloud className="w-7 h-7" />
                </div>

                <h3 className="text-sm font-bold text-slate-800">
                  Drag and drop retinal PNG / JPG / TIFF file
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Supported formats: PNG, JPG, JPEG and TIFF. Max file size 50MB.
                </p>

                <div className="flex items-center space-x-3 mt-4">
                  <label className="px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white hover:bg-[#2A2666] cursor-pointer shadow-sm">
                    <span>Browse Files</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.tiff,.tif"
                      onChange={(e) => {
                        const file = e.target.files?.[0];

                        if (!file) return;

                        const imageUrl = URL.createObjectURL(file);

                        setUploadedFile({
                          id: `UPLOAD-${Date.now().toString().slice(-6)}`,
                          name: file.name,
                          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
                          eye: selectedEye,
                          patientName: patientName,
                          sampleType: 'microaneurysms',
                          qualityScore: 96,
                          tags: ['UPLOADED_FILE', selectedEye],
                          imageUrl,
                          file,
                        });

                        setUploadStatus('complete');
                        setUploadProgress(100);
                        setPrediction(null);
                        setPredictionClassId(null);
                        setPredictionConfidence(null);
                        setPredictionError(null);
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={() => setAcquisitionMode('camera')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-slate-500" />
                    <span>Switch to Direct Camera Capture</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Upload Status Card / Active File */}
          {uploadedFile && (
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 shrink-0">
                  <RetinalFundusCanvas
                    eye={selectedEye}
                    sampleType={uploadedFile.sampleType}
                    imageUrl={uploadedFile.imageUrl}
                    showControls={false}
                    heightClass="h-12"
                    interactive={false}
                  />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900">{uploadedFile.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                      {uploadedFile.deviceSource ? 'ACQUIRED & LOCKED' : 'UPLOAD READY'}
                    </span>
                    {uploadedFile.qualityScore && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-100 text-cyan-800">
                        Score: {uploadedFile.qualityScore}%
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {uploadedFile.size} • Laterality: {selectedEye} • {uploadedFile.deviceSource || 'Topcon TRC-NW400 Digital Retinal Camera'}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setUploadedFile(null)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                >
                  Clear Frame
                </button>
                <button
                  type="button"
                  onClick={() => handleSimulateUpload(sampleScansForUpload[1])}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  Load Sample
                </button>
              </div>
            </div>
          )}

          {/* Step 2 Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <MotionButton
              type="button"
              onClick={() => setCurrentStep(1)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Patient Info</span>
            </MotionButton>

            <MotionButton
              type="button"
              id="btn-step2-continue"
              disabled={!uploadedFile}
              onClick={() => setCurrentStep(3)}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/15 disabled:opacity-50"
            >
              <span>Validate Image Quality</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </MotionButton>
          </div>
        </div>
      )}

      {/* STEP 3: IMAGE VALIDATION */}
      {currentStep === 3 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-[#1E1B4B]">
                3. Automated Image Quality & Clarity Assessment
              </h2>
              <p className="text-xs text-slate-500">
                AI diagnostic validation checks ensure fundus photo conforms to clinical grading criteria
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
              STATUS: {qualityMetrics.status}
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Visual Focus: Retinal Image */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl overflow-hidden shadow-md">
                <RetinalFundusCanvas
                  eye={selectedEye}
                  sampleType={uploadedFile?.sampleType || 'microaneurysms'}
                  imageUrl={uploadedFile?.imageUrl}
                  patientName={patientName}
                  showControls={true}
                  showAnnotationsDefault={false}
                  heightClass="h-[400px]"
                />
              </div>
            </div>

            {/* Quality Metrics Panel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase">
                    Overall Diagnostic Score
                  </span>
                  <span className="text-2xl font-black text-emerald-800">
                    {qualityMetrics.overallScore}<span className="text-xs text-slate-500 font-normal">/100</span>
                  </span>
                </div>

                <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                    style={{ width: `${qualityMetrics.overallScore}%` }} 
                  />
                </div>
              </div>

              {/* Parameter bars */}
              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Foveal Focus & Sharpness</span>
                    <span className="font-mono font-bold text-slate-900">{qualityMetrics.focus}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${qualityMetrics.focus}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Illumination & Brightness</span>
                    <span className="font-mono font-bold text-slate-900">{qualityMetrics.brightness}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${qualityMetrics.brightness}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Vascular Contrast Ratio</span>
                    <span className="font-mono font-bold text-slate-900">{qualityMetrics.contrast}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${qualityMetrics.contrast}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-1">
                    <span className="font-semibold text-slate-700">Choroidal/Retinal Visibility</span>
                    <span className="font-mono font-bold text-slate-900">{qualityMetrics.retinalVisibility}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: `${qualityMetrics.retinalVisibility}%` }} />
                  </div>
                </div>
              </div>

              {/* Technical Scan Specifications */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 font-mono">
                {uploadedFile?.deviceSource && (
                  <div className="flex justify-between text-slate-600">
                    <span>Acquisition Device:</span>
                    <span className="font-semibold text-cyan-800 truncate max-w-[200px]" title={uploadedFile.deviceSource}>
                      {uploadedFile.deviceSource}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-slate-600">
                  <span>Field of View:</span>
                  <span className="font-semibold text-slate-900">{qualityMetrics.fieldOfView}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Optical Resolution:</span>
                  <span className="font-semibold text-slate-900">{qualityMetrics.resolution}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Ingestion Format:</span>
                  <span className="font-semibold text-slate-900">
                    {uploadedFile?.deviceSource ? 'Direct Optical Feed (Lossless PNG)' : 'PNG / JPG / JPEG / TIFF'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Step 3 Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-3">
              <MotionButton
                type="button"
                onClick={() => setCurrentStep(2)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                {uploadedFile?.deviceSource ? 'Retake / Re-acquire' : 'Upload Another'}
              </MotionButton>
            </div>

            <MotionButton
              type="button"
              id="btn-step3-run-ai"
              onClick={() => setCurrentStep(4)}
              disabled={!uploadedFile?.file}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/15 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Launch AI Diagnostic Analysis</span>
            </MotionButton>
          </div>
        </div>
      )}

      {/* STEP 4: AI ANALYSIS SCREEN */}
      {currentStep === 4 && (
        <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 animate-ping" />
                <h2 className="text-base font-bold text-[#1E1B4B]">
                  4. ResNet50 AI Model Inference Processing
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Running the trained ResNet50 model on the uploaded retinal image
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200/80 px-3 py-1 rounded-lg">
                <span className="text-xs text-slate-500 font-semibold">Progress:</span>
                <span className="text-base font-black font-mono text-cyan-600">
                  {analysisProgress}%
                </span>
              </div>
              {analysisComplete && (
                <MotionButton
                  type="button"
                  id="btn-rescan-analysis"
                  onClick={handleRestartAnalysis}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-50 border border-cyan-300 text-cyan-800 hover:bg-cyan-100 shadow-xs"
                  title="Re-run AI Analysis & Scanning Laser"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Re-scan</span>
                </MotionButton>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Visual Canvas with Active High-Tech Laser Sweep */}
            <div className="lg:col-span-7">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-800 bg-slate-950">
                <RetinalFundusCanvas
                  eye={selectedEye}
                  sampleType={uploadedFile?.sampleType || 'microaneurysms'}
                  imageUrl={uploadedFile?.imageUrl}
                  patientName={patientName}
                  isScanning={false}
                  scanProgress={analysisProgress}
                  showControls={false}
                  showHeatmapDefault={analysisProgress > 65}
                  showVesselsDefault={analysisProgress > 40}
                  showAnnotationsDefault={analysisProgress > 80}
                  heightClass="h-[430px]"
                />

                {/* High-Tech Smooth Rhythmic Scanning Laser Line Overlay */}
                <ScanningLaserOverlay
                  active={!analysisComplete}
                  progress={analysisProgress}
                  stageName={stages[activeStageIndex]?.title}
                  showTelemetry={true}
                />
              </div>
            </div>

            {/* 5 Stages Progress Tracker */}
            <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  Processing Sequence Pipeline
                </div>

                <div className="space-y-2.5">
                  {stages.map((st, idx) => {
                    const isPassed = activeStageIndex > idx || analysisComplete;
                    const isProcessing = activeStageIndex === idx && !analysisComplete;

                    return (
                      <div 
                        key={idx}
                        className={`p-3 rounded-xl border transition-all ${
                          isProcessing
                            ? 'bg-cyan-50/70 border-cyan-400/50 shadow-xs'
                            : isPassed
                              ? 'bg-slate-50 border-slate-200'
                              : 'bg-white border-slate-100 opacity-60'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2.5">
                            {isPassed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                            ) : isProcessing ? (
                              <div className="w-4 h-4 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px] text-slate-400 font-bold shrink-0">
                                {idx + 1}
                              </div>
                            )}
                            <span className={`text-xs font-bold ${isProcessing ? 'text-cyan-900' : isPassed ? 'text-slate-800' : 'text-slate-400'}`}>
                              {st.title}
                            </span>
                          </div>

                          {isProcessing && (
                            <span className="text-[10px] font-mono font-bold text-cyan-600 uppercase animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 ml-6 mt-1">
                          {st.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {predictionLoading && (
                <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-200 text-xs text-cyan-900">
                  Sending the retinal image to the Flask ResNet50 backend for prediction...
                </div>
              )}

              {predictionError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800">
                  <div className="font-bold">AI analysis failed</div>
                  <div className="mt-1">{predictionError}</div>
                </div>
              )}

              {prediction && predictionConfidence !== null && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
                  <div className="text-[11px] font-bold uppercase tracking-wide text-emerald-800">
                    Model Prediction
                  </div>
                  <div className="text-base font-black text-slate-900 mt-1">
                    {prediction}
                  </div>
                  <div className="text-xs text-slate-600 mt-1">
                    Class {predictionClassId} • Confidence {predictionConfidence.toFixed(2)}%
                  </div>
                </div>
              )}

              {/* Progress completion CTA */}
              <div className="pt-3 border-t border-slate-100">
                <MotionButton
                  type="button"
                  id="btn-step4-view-results"
                  disabled={!analysisComplete}
                  onClick={() => setCurrentStep(5)}
                  className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-md shadow-indigo-950/15 disabled:opacity-40"
                >
                  {analysisComplete ? (
                    <>
                      <span>Diagnostic Analysis Complete — View Results</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </>
                  ) : (
                    <div className="flex items-center space-x-2 text-indigo-200">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      <span>Inference Running ({analysisProgress}%)</span>
                    </div>
                  )}
                </MotionButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STEP 5: SCREENING RESULTS */}
      {currentStep === 5 && (
        <div className="space-y-6">
          {/* Main Results Card */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-6">
            
            {/* Header / Outcome Banner */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2 text-xs text-slate-500 mb-1">
                  <span>Screening ID: SCR-2026-9812</span>
                  <span>•</span>
                  <span>Patient: {patientName} ({selectedPatientId})</span>
                  <span>•</span>
                  <span>{selectedEye === 'OD' ? 'Right Eye (OD)' : 'Left Eye (OS)'}</span>
                </div>
                <h2 className="text-xl font-black text-[#1E1B4B] tracking-tight">
                  Diabetic Retinopathy Screening Result
                </h2>
              </div>

              {/* Overall Risk Badge */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <div className="text-[11px] font-semibold text-slate-500">AI Model Prediction</div>
                  <div className="text-sm font-bold text-[#1E1B4B]">
                    {prediction || 'Prediction unavailable'}
                  </div>
                </div>
                <span className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 flex items-center space-x-1.5 shadow-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>{predictionConfidence !== null ? `${predictionConfidence.toFixed(2)}% Confidence` : 'No Result'}</span>
                </span>
              </div>
            </div>

            {/* Prominent Required Medical Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start space-x-3">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>IMPORTANT MEDICAL DISCLAIMER:</strong> This AI-assisted screening provides a risk assessment and is not a definitive medical diagnosis. Clinical assessment should be performed by an appropriately qualified healthcare professional.
              </p>
            </div>

            {/* Split Screen: Retinal Fundus Viewer with Heatmaps & Clinical Findings */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Fundus Visual Workspace */}
              <div className="lg:col-span-7 space-y-3">
                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-800">
                  <RetinalFundusCanvas
                    eye={selectedEye}
                    sampleType={uploadedFile?.sampleType || 'microaneurysms'}
                    imageUrl={uploadedFile?.imageUrl}
                    patientName={patientName}
                    showControls={true}
                    showHeatmapDefault={true}
                    showAnnotationsDefault={true}
                    heightClass="h-[420px]"
                  />
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 px-2 font-mono">
                  <span>45° Color Fundus • Mag: 100%</span>
                  <span>Grad-CAM Attention Heatmap Active</span>
                </div>
              </div>

              {/* Quantitative Metrics & AI Findings */}
              <div className="lg:col-span-5 space-y-4">
                {/* Probability Cards */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">
                      Pre-Diabetes Risk
                    </div>
                    <div className="text-2xl font-black text-rose-600 mt-1">
                      {predictionClassId === 0 ? 'Low' : predictionClassId !== null ? 'Based on DR class' : '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      Glycemic microvascular index
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                    <div className="text-[11px] font-semibold text-slate-500 uppercase">
                      AI Model Confidence
                    </div>
                    <div className="text-2xl font-black text-emerald-600 mt-1">
                      {predictionConfidence !== null ? `${predictionConfidence.toFixed(2)}%` : '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      ResNet50 model confidence
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
                  <div className="text-[11px] font-semibold text-slate-500 uppercase">
                    Diabetic Retinopathy Classification
                  </div>
                  <div className="text-lg font-black text-[#1E1B4B] mt-1">
                    {prediction || 'Prediction unavailable'}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    ResNet50 • Class {predictionClassId ?? '—'}
                  </div>
                </div>

                {/* Estimated HbA1c correlation */}
                <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-[#1E1B4B]">Estimated HbA1c Range:</span>
                    <p className="text-[11px] text-slate-500">Not provided by the classification API</p>
                  </div>
                  <span className="font-mono font-black text-base text-indigo-950 px-2.5 py-1 rounded bg-white border border-indigo-200">
                    6.1% – 6.4%
                  </span>
                </div>

                {/* Model Output */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                  <div className="font-bold text-slate-800 uppercase tracking-wide">
                    ResNet50 Model Output
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-slate-200/80">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">Predicted Class</span>
                      <span className="font-mono text-indigo-700 font-bold">
                        Class {predictionClassId ?? '—'}
                      </span>
                    </div>
                    <div className="mt-2 text-sm font-black text-[#1E1B4B]">
                      {prediction || 'Prediction unavailable'}
                    </div>
                    <div className="mt-1 text-[10px] text-slate-500">
                      The model predicts the diabetic retinopathy grade from the uploaded retinal image.
                    </div>
                  </div>
                </div>

                {/* AI Interpretation */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
                  <div className="font-bold text-slate-800 uppercase tracking-wide">
                    AI Model Interpretation
                  </div>
                  <ul className="list-disc pl-4 space-y-1 text-[11px] leading-relaxed text-slate-600">
                    <li>ResNet50 classified the uploaded retinal image as {prediction || 'unavailable'}.</li>
                    <li>Model confidence: {predictionConfidence !== null ? `${predictionConfidence.toFixed(2)}%` : 'unavailable'}.</li>
                    <li>This output is an AI model prediction and should be reviewed by a qualified healthcare professional.</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Model Result Summary */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div className="font-bold text-slate-800 uppercase">
                Model Result Summary
              </div>
              <p className="text-slate-600 leading-relaxed text-[11px]">
                The current screening result is based on the trained ResNet50 classifier and the retinal image submitted in this screening.
              </p>
            </div>

            {/* Recommended Next Action */}
            <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs space-y-1">
              <span className="font-bold text-[#1E1B4B] uppercase tracking-wide">
                Recommended Next Clinical Action
              </span>
              <p className="text-slate-700 leading-relaxed text-[11px]">
                Review the AI model prediction with a qualified eye-care professional before making any clinical decision.
              </p>
            </div>

            {/* Doctor Review & Signature Section */}
            <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-slate-800 uppercase">
                  Attending Clinician Endorsement
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-500 font-medium">Doctor: Dr. Evelyn Wilson, MD</span>
                </div>
              </div>

              <textarea
                rows={2}
                value={doctorNotes}
                onChange={(e) => setDoctorNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-900/10"
                placeholder="Doctor's clinical addendum and notes..."
              />

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center space-x-2">
                  <MotionButton
                    type="button"
                    onClick={() => setDoctorApproval('approved')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                      doctorApproval === 'approved'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Sign</span>
                  </MotionButton>

                  <MotionButton
                    type="button"
                    onClick={() => setDoctorApproval('flagged')}
                    className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold ${
                      doctorApproval === 'flagged'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Flag for Specialist Panel</span>
                  </MotionButton>

                  <MotionButton
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Re-analyze</span>
                  </MotionButton>
                </div>

                <div className="flex items-center space-x-2">
                  <MotionButton
                    type="button"
                    id="btn-save-result"
                    onClick={handleSaveResult}
                    disabled={!prediction || predictionConfidence === null}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-[#1E1B4B] text-white shadow-sm disabled:opacity-50"
                  >
                    <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Save Result to Record</span>
                  </MotionButton>

                  <MotionButton
                    type="button"
                    id="btn-generate-report"
                    onClick={() => onGenerateReport('SCR-2026-9812')}
                    className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-600 text-white shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Generate PDF Report</span>
                  </MotionButton>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
