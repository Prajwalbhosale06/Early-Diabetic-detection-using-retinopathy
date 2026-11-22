import React, { useState } from 'react';
import { 
  HelpCircle, 
  BookOpen, 
  Camera, 
  Sparkles, 
  AlertCircle, 
  Phone, 
  Mail, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Info, 
  Layers,
  Cpu
} from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does RetinaAI correlate retinal microvascular signs with pre-diabetes risk?',
      a: 'The retina is the only anatomical site where microcirculation can be directly visualized non-invasively. Early subclinical hyperglycemia and insulin resistance induce endothelial dysfunction, causing capillary basement membrane thickening, localized ischemia, and increased vascular permeability. RetinaAI quantifies subtle arteriolar caliber narrowing, venular dilation, arteriolar-to-venular ratio (AVR), and isolated microaneurysms before systemic diabetic retinopathy manifests, providing early metabolic warning.'
    },
    {
      q: 'Is this screening considered a definitive diagnostic test for diabetes?',
      a: 'No. As stated in our regulatory compliance notice, RetinaAI provides a clinical risk assessment and triage support. Definitive diagnosis requires venous plasma glucose (FPG), oral glucose tolerance testing (OGTT), or standardized laboratory HbA1c testing performed by an authorized medical provider.'
    },
    {
      q: 'What are the minimum image requirements for an accurate screening?',
      a: 'A 45-degree field-of-view color fundus photograph centered on the macula and optic disc, captured at 1920×1080 resolution or higher. Non-mydriatic cameras with minimum 3.5mm pupil clearance are supported.'
    },
    {
      q: 'What action should be taken if an image quality score is marked "POOR"?',
      a: 'A quality score below 80% indicates inadequate focal clarity, eyelid artifact, or uneven illumination. The system recommends re-acquiring the fundus photograph with appropriate chin-rest positioning and patient fixation before running AI inference.'
    },
    {
      q: 'What is the underlying neural network architecture?',
      a: 'RetinaNet-v4.2 utilizes a deep convolutional backbone with multi-scale feature pyramids and spatial attention modules (Grad-CAM). It has been validated across diverse multi-ethnic clinical trial datasets comprising over 420,000 adjudicated images.'
    }
  ];

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-[#1E1B4B] tracking-tight">
            Clinical Documentation & Technical Support
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Operating manuals, acquisition protocols, biological mechanisms, and assistance hotline
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            System Online • 99.98% Uptime
          </span>
        </div>
      </div>

      {/* Guide Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center">
            <Camera className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
            Fundus Camera Calibration
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard operating procedure for non-mydriatic cameras (Topcon TRC-NW400, Zeiss Visucam, Canon CR-2). Optimal flash intensity and alignment targets.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-[#1E1B4B] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-500" />
          </div>
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
            Biomarker Grading Protocol
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Understanding microaneurysm cluster counts, arteriolar-to-venular ratio (AVR) deviations, and estimated HbA1c metabolic ranges.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2.5">
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-slate-900 uppercase tracking-wide">
            Regulatory & Validation Papers
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Peer-reviewed multicenter validation trials, clinical study summaries, FDA 510(k) cleared software specifications.
          </p>
        </div>
      </div>

      {/* Frequently Asked Questions Accordion */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-[#1E1B4B] uppercase tracking-wide">
          Frequently Asked Questions
        </h2>

        <div className="space-y-2.5">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div 
                key={idx}
                className="rounded-xl border border-slate-200 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-3.5 bg-slate-50/70 hover:bg-slate-100 flex items-center justify-between text-left text-xs font-bold text-slate-900 cursor-pointer transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-2" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 bg-white text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Support Hotline & System Specs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-3">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
            Clinical Tele-Ophthalmology Support
          </h3>
          <p className="text-xs text-slate-600">
            Dedicated 24/7 specialist advisory panel for secondary reading assistance and unusual clinical anomalies.
          </p>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-center space-x-2">
              <Phone className="w-4 h-4 text-cyan-700" />
              <span>Priority Hotline: +1 (800) 555-RETINA</span>
            </div>
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-cyan-700" />
              <span>Clinical Desk: clinical-support@retinaai.health</span>
            </div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2 text-xs font-mono">
          <h3 className="text-xs font-bold font-sans text-slate-800 uppercase tracking-wide">
            Platform Specifications
          </h3>
          <div className="space-y-1 divide-y divide-slate-100 text-slate-600">
            <div className="flex justify-between pt-1">
              <span>Application Version:</span>
              <span className="font-semibold text-slate-900">RetinaAI v3.4.0 Desktop</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Inference Engine:</span>
              <span className="font-semibold text-slate-900">RetinaNet-v4.2.1-Prod</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Device Identifier:</span>
              <span className="font-semibold text-slate-900">WS-CLINIC-DESK-04</span>
            </div>
            <div className="flex justify-between pt-1">
              <span>Regulatory Tier:</span>
              <span className="font-semibold text-slate-900">FDA SaMD Class II Triage</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
