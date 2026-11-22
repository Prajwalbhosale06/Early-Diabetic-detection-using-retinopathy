import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Scan, Crosshair, Cpu } from 'lucide-react';

interface ScanningLaserOverlayProps {
  active?: boolean;
  progress?: number;
  stageName?: string;
  showTelemetry?: boolean;
  className?: string;
}

export const ScanningLaserOverlay: React.FC<ScanningLaserOverlayProps> = ({
  active = true,
  progress = 0,
  stageName = 'Retinal Microvascular Inference',
  showTelemetry = true,
  className = '',
}) => {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          key="scanning-laser-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.6 } }}
          className={`absolute inset-0 pointer-events-none overflow-hidden z-20 select-none ${className}`}
        >
          {/* SVG Definitions for Gradients & Optical Filters */}
          <svg className="absolute w-0 h-0" aria-hidden="true">
            <defs>
              {/* Horizontal Laser Core Gradient */}
              <linearGradient id="laserBeamCoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
                <stop offset="6%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="20%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="45%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.95" />
                <stop offset="80%" stopColor="#22d3ee" stopOpacity="0.85" />
                <stop offset="94%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>

              {/* Trailing Volumetric Photon Sweep Gradient (Upward Fade) */}
              <linearGradient id="laserTrailingSheetGrad" x1="0%" y1="100%" x2="0%" y2="0%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.38" />
                <stop offset="25%" stopColor="#0891b2" stopOpacity="0.22" />
                <stop offset="60%" stopColor="#0e7490" stopOpacity="0.08" />
                <stop offset="100%" stopColor="#155e75" stopOpacity="0" />
              </linearGradient>

              {/* Forward Target Illumination Band (Downward Fade) */}
              <linearGradient id="laserForwardSheetGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
                <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.12" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>

              {/* Optical Emitter Node Glow */}
              <radialGradient id="laserEmitterGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
                <stop offset="40%" stopColor="#22d3ee" stopOpacity="0.9" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </radialGradient>

              {/* Micro-mesh Grid Pattern */}
              <pattern id="retinaDiagnosticGrid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path
                  d="M 40 0 L 0 0 0 40"
                  fill="none"
                  stroke="#06b6d4"
                  strokeWidth="0.5"
                  strokeOpacity="0.12"
                />
                <circle cx="0" cy="0" r="1" fill="#38bdf8" fillOpacity="0.35" />
              </pattern>
            </defs>
          </svg>

          {/* Diagnostic Grid Canvas Overlay */}
          <div className="absolute inset-0 opacity-40 mix-blend-screen">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <rect width="100%" height="100%" fill="url(#retinaDiagnosticGrid)" />
            </svg>
          </div>

          {/* High-Tech Diagnostic Corner Targeting Brackets */}
          <div className="absolute top-3 left-3 w-6 h-6 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <div className="absolute top-3 right-3 w-6 h-6 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <div className="absolute bottom-3 left-3 w-6 h-6 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]" />
          <div className="absolute bottom-3 right-3 w-6 h-6 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm shadow-[0_0_8px_rgba(6,182,212,0.4)]" />

          {/* Top Status HUD Telemetry Banner */}
          {showTelemetry && (
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="absolute top-3.5 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 backdrop-blur-md text-[11px] font-mono text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.25)]"
            >
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
              <span className="font-bold tracking-wider uppercase text-white">
                532nm Confocal Laser Sweep
              </span>
              <span className="text-cyan-600">•</span>
              <span className="text-cyan-400/90 font-medium truncate max-w-[170px] sm:max-w-[240px]">
                {stageName}
              </span>
              <span className="text-cyan-600">•</span>
              <span className="font-bold text-cyan-200">{Math.round(progress)}%</span>
            </motion.div>
          )}

          {/* Smooth, Rhythmic Scanning Laser Line Motion Assembly */}
          <motion.div
            className="absolute left-0 right-0 w-full"
            style={{
              willChange: 'transform',
            }}
            animate={{
              top: ['3%', '94%', '3%'],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: [0.45, 0.05, 0.55, 0.95], // Smooth rhythmic harmonic oscillation
            }}
          >
            {/* Trailing Volumetric Photon Sheet (Upward trailing glow) */}
            <div className="absolute bottom-0 left-0 right-0 h-28 -translate-y-[2px] pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="url(#laserTrailingSheetGrad)" />
              </svg>
            </div>

            {/* Forward Focus Glow (Narrow downward illumination) */}
            <div className="absolute top-[2px] left-0 right-0 h-10 pointer-events-none">
              <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                <rect width="100" height="100" fill="url(#laserForwardSheetGrad)" />
              </svg>
            </div>

            {/* Laser Beam Optics & SVG Core Line */}
            <div className="relative w-full flex items-center">
              {/* Diffuse Core Glow Aura */}
              <div 
                className="absolute inset-x-0 h-[6px] -top-[2px] blur-[3px]"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(6,182,212,0.3) 10%, rgba(34,211,238,0.9) 50%, rgba(6,182,212,0.3) 90%, transparent 100%)',
                }}
              />

              {/* Intense Sharp Laser Line (SVG with Gradient) */}
              <svg 
                className="w-full h-[3px] overflow-visible drop-shadow-[0_0_10px_rgba(34,211,238,0.95)] drop-shadow-[0_0_20px_rgba(6,182,212,0.7)]" 
                preserveAspectRatio="none" 
                viewBox="0 0 1000 3"
              >
                <line
                  x1="0"
                  y1="1.5"
                  x2="1000"
                  y2="1.5"
                  stroke="url(#laserBeamCoreGrad)"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />
              </svg>

              {/* Left Emitter Node with Pulsing Ring */}
              <div className="absolute left-2 -translate-y-1/2 top-1/2 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-5 h-5 rounded-full border border-cyan-300 bg-cyan-400/20"
                />
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#22d3ee]" />
              </div>

              {/* Right Emitter Node with Pulsing Ring */}
              <div className="absolute right-2 -translate-y-1/2 top-1/2 flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.4, 1], opacity: [0.8, 0.2, 0.8] }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute w-5 h-5 rounded-full border border-cyan-300 bg-cyan-400/20"
                />
                <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_10px_#22d3ee]" />
              </div>

              {/* Center Optical Reticle & Micron Position Callout */}
              <div className="absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
                {/* Crosshair Target */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}
                  className="relative flex items-center justify-center w-7 h-7"
                >
                  <div className="absolute inset-0 rounded-full border border-dashed border-cyan-300/80" />
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_#ffffff]" />
                </motion.div>

                {/* Floating Micro-Telemetry HUD Tag Attached to Laser Line */}
                <motion.div
                  initial={{ opacity: 0.85 }}
                  animate={{ opacity: [0.75, 1, 0.75] }}
                  transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  className="hidden sm:flex items-center space-x-1.5 px-2 py-0.5 rounded-md bg-slate-950/85 border border-cyan-500/50 backdrop-blur-md text-[10px] font-mono text-cyan-200 shadow-md shadow-cyan-950/40"
                >
                  <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="text-cyan-400 font-bold">SLO-OCT:</span>
                  <span>λ 532nm</span>
                  <span className="text-cyan-600">|</span>
                  <span className="text-white font-semibold">
                    Z: {Math.round(120 + (progress * 1.6))}µm
                  </span>
                </motion.div>
              </div>

            </div>
          </motion.div>

          {/* Bottom Precision Scale / Retinal Plane Coordinate Bar */}
          <div className="absolute bottom-2 inset-x-4 flex items-center justify-between text-[10px] font-mono text-cyan-400/70 bg-slate-950/70 px-3 py-1 rounded-lg border border-cyan-900/60 backdrop-blur-xs">
            <div className="flex items-center space-x-2">
              <Crosshair className="w-3 h-3 text-cyan-400" />
              <span>FOV: 45° POSTERIOR POLE</span>
            </div>
            <div className="flex items-center space-x-3">
              <span className="hidden md:inline text-slate-400">RESOLUTION: 16-BIT DICOM</span>
              <span className="text-cyan-300 font-bold">ACTIVE SCAN AXIS: Y-LATERAL</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
