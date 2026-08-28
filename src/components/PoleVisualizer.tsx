/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Footprints, 
  Car, 
  Wind, 
  Flame, 
  Sun, 
  Moon, 
  Zap, 
  Activity,
  CloudFog,
  Dog,
  ShieldCheck,
  ShieldAlert,
  Snowflake,
  MoveHorizontal,
  Play,
  RotateCcw,
  Sparkles,
  Sliders,
  Radio,
  Layers
} from 'lucide-react';

export const PoleVisualizer: React.FC = () => {
  const {
    light,
    airQuality,
    microGrid,
    poles,
    selectedPoleId,
    setSelectedPoleId,
    vehiclePosition,
    pedestrianPosition,
    animalPosition,
    showAnimal,
    radarSpeedKmh,
    radarDistanceM,
    setVehiclePosition,
    setPedestrianPosition,
    setAnimalPosition,
    setShowAnimal,
    togglePetImmunity,
    setFogDensity,
    toggleWinterMode,
    triggerPedestrianMotion,
    triggerVehicleMotion,
    triggerAnimalMotion,
    simulateAirPollutionSpike
  } = useStreetlight();

  const [activeTab, setActiveTab] = useState<'corridor' | 'move' | 'weather' | 'pet_filter'>('corridor');
  const [selectedEntity, setSelectedEntity] = useState<'vehicle' | 'pedestrian' | 'animal'>('vehicle');
  const [isDrivingCar, setIsDrivingCar] = useState(false);
  const [isWalkingPed, setIsWalkingPed] = useState(false);
  const [walkStep, setWalkStep] = useState(0);

  // SVG Dragging state
  const [draggingEntity, setDraggingEntity] = useState<'vehicle' | 'pedestrian' | 'animal' | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Walk step animation cycle
  useEffect(() => {
    if (!isWalkingPed) return;
    const interval = setInterval(() => {
      setWalkStep(s => (s + 1) % 4);
    }, 150);
    return () => clearInterval(interval);
  }, [isWalkingPed]);

  // Automated drive animation across all 8 poles
  useEffect(() => {
    if (!isDrivingCar) return;
    const interval = setInterval(() => {
      setVehiclePosition((prev: any) => {
        const cur = typeof prev === 'number' ? prev : 0;
        const next = cur + 1.5;
        if (next >= 100) {
          setIsDrivingCar(false);
          return 100;
        }
        return next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isDrivingCar, setVehiclePosition]);

  // Automated walk animation across corridor
  useEffect(() => {
    if (!isWalkingPed) return;
    const interval = setInterval(() => {
      setPedestrianPosition((prev: any) => {
        const cur = typeof prev === 'number' ? prev : 100;
        const next = cur - 1.2;
        if (next <= 0) {
          setIsWalkingPed(false);
          return 0;
        }
        return next;
      });
    }, 50);
    return () => clearInterval(interval);
  }, [isWalkingPed, setPedestrianPosition]);

  // Convert SVG client coords to 0-100% position along the road
  const handlePointerDown = (entity: 'vehicle' | 'pedestrian' | 'animal', e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setDraggingEntity(entity);
    setSelectedEntity(entity);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingEntity || !svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xClamped = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const pct = Math.round((xClamped / rect.width) * 100);

    if (draggingEntity === 'vehicle') setVehiclePosition(pct);
    if (draggingEntity === 'pedestrian') setPedestrianPosition(pct);
    if (draggingEntity === 'animal') setAnimalPosition(pct);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (draggingEntity) {
      setDraggingEntity(null);
      (e.target as Element).releasePointerCapture?.(e.pointerId);
    }
  };

  // Weather & Fog calculation
  const isFoggy = light.fogDensity >= 30 || light.isWinterMode;
  
  // Map 0-100% to SVG coordinates (0 to 400 viewBox width)
  const vehicleSvgX = (vehiclePosition / 100) * 350; // 0 to 350
  const pedestrianSvgX = (pedestrianPosition / 100) * 370;
  const animalSvgX = (animalPosition / 100) * 365;

  // Selected pole details
  const activePole = poles.find(p => p.id === selectedPoleId) || poles[3];

  return (
    <div id="pole-visualizer-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-4 lg:p-6 flex flex-col shadow-lg relative overflow-hidden">
      
      {/* Top Bar inside Visualizer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <span>8-Pole Smart Streetlight Corridor & Interactive Simulation</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Edge-connected wave lighting across 8 poles with continuous presence intelligence. Drag a vehicle or pedestrian to test the 40% safeguard.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Fog / Winter Mode Badge */}
          {isFoggy && (
            <span className={`px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 ${
              light.fogPenetrationActive 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/50 animate-pulse' 
                : 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60'
            }`}>
              <CloudFog className="w-3.5 h-3.5 text-amber-400" />
              {light.fogPenetrationActive ? 'Fog Penetration Boost Active' : `Winter Fog: ${light.fogDensity}%`}
            </span>
          )}

          {/* Pet Immunity Status Badge */}
          {light.animalDetected && (
            <span className={`px-2.5 py-1 rounded-md border font-semibold flex items-center gap-1.5 ${
              light.animalFiltered 
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40' 
                : 'bg-rose-950/80 text-rose-300 border-rose-500/40 animate-pulse'
            }`}>
              <Dog className="w-3.5 h-3.5" />
              {light.animalFiltered ? 'Pet Filtered (0W Wasted)' : 'False Trigger (+45W Wasted)'}
            </span>
          )}

          {/* Active Pole Info Pill */}
          <span className="px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-xs flex items-center gap-1.5">
            <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span>Active Focus: <strong>{activePole.name.split('(')[0]}</strong> ({activePole.intensity}%)</span>
          </span>
        </div>
      </div>

      {/* 8-Pole Network Real-Time Status Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5 sm:gap-2 mb-3">
        {poles.map((pole, idx) => {
          const isSelected = pole.id === selectedPoleId;
          const isLit = pole.intensity > 25;
          return (
            <button
              key={pole.id}
              type="button"
              onClick={() => setSelectedPoleId(pole.id)}
              className={`p-2 rounded-xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected 
                  ? 'bg-slate-850 border-cyan-500 shadow-md ring-1 ring-cyan-500/50' 
                  : 'bg-slate-950/70 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-300">
                  Node #{idx + 1}
                </span>
                <span className={`w-2 h-2 rounded-full ${
                  isLit ? 'bg-amber-400 shadow-[0_0_8px_#f59e0b]' : 'bg-slate-600'
                }`} />
              </div>

              <div className="mt-1 flex items-baseline justify-between font-mono">
                <span className={`text-xs font-bold ${isLit ? 'text-amber-400' : 'text-slate-400'}`}>
                  {pole.intensity}%
                </span>
                <span className="text-[10px] text-slate-500">
                  {pole.wattage}W
                </span>
              </div>

              <div className="mt-1 flex items-center justify-between text-[9px] text-slate-500">
                <span>SoC: {pole.batterySoC}%</span>
                {pole.motionDetected && (
                  <span className="text-cyan-400 font-semibold uppercase">Trigger</span>
                )}
              </div>

              {/* Position indicator line */}
              <div 
                className={`h-0.5 w-full mt-1.5 rounded-full ${
                  isLit ? 'bg-amber-400' : 'bg-slate-800'
                }`} 
              />
            </button>
          );
        })}
      </div>

      {/* Main Simulation Viewport (Canvas / SVG Stage) */}
      <div 
        id="visualizer-stage-canvas"
        className={`relative w-full rounded-xl overflow-hidden flex items-end justify-center min-h-[300px] border transition-colors duration-700 select-none ${
          light.isNightTime
            ? isFoggy ? 'bg-slate-950/95 border-slate-800' : 'bg-slate-950 border-slate-800'
            : 'bg-gradient-to-b from-sky-400 via-sky-200 to-amber-50 border-sky-300'
        }`}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        
        {/* Background Sky Atmosphere (Stars or Daylight Clouds) */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {light.isNightTime ? (
            <>
              {/* Moon in Sky */}
              <div className="absolute top-4 right-10 w-9 h-9 rounded-full bg-slate-100 shadow-[0_0_25px_rgba(255,255,255,0.4)] opacity-90" />
              <div className="absolute top-5 right-9 w-8 h-8 rounded-full bg-slate-950 opacity-80" />
            </>
          ) : (
            <>
              {/* Sun in Sky */}
              <div className="absolute top-4 right-10 w-12 h-12 rounded-full bg-amber-400 shadow-[0_0_35px_#f59e0b] opacity-90 animate-pulse" />
            </>
          )}

          {/* Distant Urban City Skyline */}
          <svg className="absolute bottom-14 inset-x-0 w-full h-20 opacity-20 pointer-events-none" preserveAspectRatio="none" viewBox="0 0 500 100">
            <polygon points="0,100 0,60 30,60 30,40 55,40 55,70 80,70 80,30 110,30 110,65 140,65 140,45 170,45 170,80 200,80 200,35 230,35 230,75 260,75 260,25 290,25 290,65 320,65 320,50 350,50 350,75 380,75 380,30 420,30 420,60 460,60 460,40 500,40 500,100" fill="#334155" />
          </svg>
        </div>

        {/* Dynamic Winter Fog & Mist Layers (Reacts to Fog Density) */}
        {light.fogDensity > 0 && (
          <div 
            className="absolute inset-0 pointer-events-none overflow-hidden z-15 transition-opacity duration-700"
            style={{ opacity: light.fogDensity / 100 }}
          >
            <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-slate-200/25 via-slate-300/15 to-transparent backdrop-blur-[2px] animate-pulse" />
            <div className="absolute top-1/4 -left-10 right-0 h-28 bg-gradient-to-r from-slate-100/10 via-sky-100/20 to-slate-100/10 rounded-full blur-xl transform -rotate-1" />
            <div className="absolute top-1/2 -right-10 left-0 h-24 bg-gradient-to-r from-slate-100/10 via-amber-100/15 to-slate-100/10 rounded-full blur-xl" />
          </div>
        )}

        {/* SVG Simulation Stage (400 x 260 coordinate space) */}
        <div className="relative z-20 w-full h-80 flex items-end justify-center">
          <svg 
            ref={svgRef} 
            className="w-full h-full cursor-crosshair" 
            viewBox="0 0 400 260" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            
            {/* SVG Definitions for Beam Gradients */}
            <defs>
              <linearGradient id="beamNormal" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.85" />
                <stop offset="50%" stopColor="#fde047" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="0.02" />
              </linearGradient>

              <linearGradient id="beamFog" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.95" />
                <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.75" />
                <stop offset="80%" stopColor="#fde68a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#fef08a" stopOpacity="0.05" />
              </linearGradient>

              <radialGradient id="poolNormal" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#fde047" stopOpacity="0" />
              </radialGradient>

              <radialGradient id="poolFog" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </radialGradient>

              <linearGradient id="radarConeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
              </linearGradient>

              {/* Pedestrian clothing gradient */}
              <linearGradient id="jacketGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" />
                <stop offset="100%" stopColor="#0369a1" />
              </linearGradient>
              <linearGradient id="pantsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#334155" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>

            {/* Ground Road Surface & Sidewalk */}
            <rect x="0" y="234" width="400" height="26" fill="#090d16" />
            <line x1="0" y1="234" x2="400" y2="234" stroke="#334155" strokeWidth="2" />
            
            {/* Road Lane Markings */}
            <line x1="10" y1="246" x2="55" y2="246" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="75" y1="246" x2="135" y2="246" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="155" y1="246" x2="215" y2="246" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="235" y1="246" x2="295" y2="246" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />
            <line x1="315" y1="246" x2="390" y2="246" stroke="#475569" strokeWidth="2" strokeDasharray="6 6" />

            {/* ========================================================================= */}
            {/* 5 SMART POLES RENDERING WITH WAVE LIGHTING                                */}
            {/* ========================================================================= */}
            {poles.map((pole, idx) => {
              // Calculate SVG X coordinate for this pole (40, 120, 200, 280, 360)
              const poleX = (pole.positionPct / 100) * 400;
              const isSelected = pole.id === selectedPoleId;
              const isLit = pole.intensity > 0 && light.isNightTime;
              const isFogPen = pole.fogPenetrationActive;
              const beamSpread = isFogPen ? 70 : Math.max(18, (pole.intensity / 100) * 55);
              const beamOp = isLit ? (isFogPen ? 0.9 : Math.max(0.15, pole.intensity / 100)) : 0;
              const headEmitterX = poleX + 16;
              const headEmitterY = 66;

              return (
                <g key={pole.id} id={`svg-pole-${idx + 1}`}>
                  
                  {/* Light Beam Cone from Luminaire Head */}
                  {isLit && (
                    <g opacity={beamOp}>
                      <polygon
                        points={`${headEmitterX},${headEmitterY} ${headEmitterX - beamSpread},234 ${headEmitterX + beamSpread},234`}
                        fill={isFogPen ? 'url(#beamFog)' : 'url(#beamNormal)'}
                        className="transition-all duration-300 ease-out"
                      />
                      {/* Ground pool */}
                      <ellipse
                        cx={headEmitterX}
                        cy="235"
                        rx={beamSpread * 0.9}
                        ry={isFogPen ? 11 : 7}
                        fill={isFogPen ? 'url(#poolFog)' : 'url(#poolNormal)'}
                      />
                      {/* Fog penetration ray highlights */}
                      {isFogPen && (
                        <>
                          <line x1={headEmitterX} y1={headEmitterY} x2={headEmitterX - beamSpread * 0.5} y2="234" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.7" />
                          <line x1={headEmitterX} y1={headEmitterY} x2={headEmitterX} y2="234" stroke="#fde047" strokeWidth="2" strokeOpacity="0.8" />
                          <line x1={headEmitterX} y1={headEmitterY} x2={headEmitterX + beamSpread * 0.5} y2="234" stroke="#fbbf24" strokeWidth="1.5" strokeOpacity="0.7" />
                        </>
                      )}
                    </g>
                  )}

                  {/* Motion Detection Sensor Scanning Cone */}
                  {pole.motionDetected && (
                    <polygon
                      points={`${poleX},95 ${poleX - 35},234 ${poleX + 35},234`}
                      fill="url(#radarConeGrad)"
                      className="animate-pulse"
                    />
                  )}

                  {/* Pole Base / Battery Enclosure */}
                  <rect x={poleX - 5} y="196" width="10" height="38" rx="2" fill="#1e293b" stroke={isSelected ? '#38bdf8' : '#475569'} strokeWidth={isSelected ? '1.5' : '1'} />
                  {/* Battery LED */}
                  <circle cx={poleX} cy="220" r="1.5" fill={pole.batterySoC > 30 ? '#10b981' : '#ef4444'} />

                  {/* Vertical Steel Mast */}
                  <rect x={poleX - 2} y="55" width="4" height="142" fill="#334155" />
                  <rect x={poleX - 1} y="55" width="1.5" height="142" fill="#64748b" opacity="0.6" />

                  {/* Solar Panel on Mast Top */}
                  <line x1={poleX} y1="55" x2={poleX} y2="40" stroke="#475569" strokeWidth="2" />
                  <polygon 
                    points={`${poleX - 16},32 ${poleX + 16},28 ${poleX + 14},38 ${poleX - 18},42`} 
                    fill="#1e1b4b" 
                    stroke="#38bdf8" 
                    strokeWidth="1" 
                  />
                  <line x1={poleX - 5} y1="31" x2={poleX - 7} y2="41" stroke="#60a5fa" strokeWidth="0.8" />
                  <line x1={poleX + 5} y1="29" x2={poleX + 3} y2="39" stroke="#60a5fa" strokeWidth="0.8" />

                  {/* Sensor module on Mast */}
                  <rect x={poleX - 5} y="90" width="10" height="8" rx="1.5" fill="#0f172a" stroke="#38bdf8" strokeWidth="0.8" />
                  <circle cx={poleX} cy="94" r="1.2" fill={pole.motionDetected ? '#f59e0b' : '#0284c7'} />

                  {/* Mast Arm & Luminaire Head */}
                  <path
                    d={`M ${poleX},60 C ${poleX},54 ${poleX + 10},54 ${poleX + 16},58 L ${poleX + 18},63`}
                    fill="none"
                    stroke="#475569"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <polygon
                    points={`${poleX + 10},61 ${poleX + 22},63 ${poleX + 20},67 ${poleX + 11},66`}
                    fill="#1e293b"
                    stroke="#64748b"
                    strokeWidth="1"
                  />
                  {/* LED Emitter Glass */}
                  <line
                    x1={poleX + 12}
                    y1={66.5}
                    x2={poleX + 20}
                    y2={67}
                    stroke={isLit ? (isFogPen ? '#f59e0b' : '#fef08a') : '#475569'}
                    strokeWidth={isLit ? '2.5' : '1'}
                    strokeLinecap="round"
                  />

                  {/* Pole Identification Label Tag */}
                  <g 
                    transform={`translate(${poleX}, 248)`} 
                    className="cursor-pointer"
                    onClick={() => setSelectedPoleId(pole.id)}
                  >
                    <rect 
                      x="-14" 
                      y="-4" 
                      width="28" 
                      height="8" 
                      rx="2" 
                      fill={isSelected ? '#0369a1' : '#0f172a'} 
                      stroke={isSelected ? '#38bdf8' : '#334155'} 
                      strokeWidth="0.8" 
                    />
                    <text x="0" y="2" textAnchor="middle" fill={isSelected ? '#ffffff' : '#94a3b8'} fontSize="5" fontWeight="bold" fontFamily="monospace">
                      POLE {idx + 1}
                    </text>
                  </g>

                  {/* Selection Indicator Ring above pole */}
                  {isSelected && (
                    <circle cx={poleX} cy="18" r="3" fill="#38bdf8" className="animate-bounce" />
                  )}
                </g>
              );
            })}

            {/* ========================================================================= */}
            {/* 1. INTERACTIVE VEHICLE SPRITE                                             */}
            {/* ========================================================================= */}
            <g 
              id="sprite-vehicle"
              transform={`translate(${vehicleSvgX}, 196)`}
              className="cursor-grab active:cursor-grabbing transition-transform"
              onPointerDown={(e) => handlePointerDown('vehicle', e)}
            >
              {/* Target Highlight Ring if Selected */}
              {selectedEntity === 'vehicle' && (
                <rect x="-3" y="4" width="70" height="38" rx="6" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              )}
              
              {/* Radar metric over vehicle */}
              <text x="32" y="2" textAnchor="middle" fill="#38bdf8" fontSize="6.5" fontWeight="bold" fontFamily="monospace">
                {radarSpeedKmh > 0 ? `${radarSpeedKmh} km/h • ${radarDistanceM}m` : `RADAR TARGET • ${radarDistanceM}m`}
              </text>

              {/* Car Body Silhouette */}
              <path d="M 4,26 L 16,12 L 44,12 L 56,26 L 62,26 L 62,34 L 0,34 L 0,26 Z" fill="#0284c7" stroke="#38bdf8" strokeWidth="1.5" />
              {/* Car Windows */}
              <polygon points="18,14 28,14 28,24 10,24" fill="#0f172a" />
              <polygon points="32,14 42,14 50,24 32,24" fill="#0f172a" />
              {/* Wheels */}
              <circle cx="14" cy="34" r="4.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.8" />
              <circle cx="48" cy="34" r="4.5" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.8" />
              
              {/* Vehicle Headlights Beam */}
              <polygon 
                points="62,28 100,20 100,38 62,31" 
                fill={isFoggy ? '#fbbf24' : '#fef08a'} 
                fillOpacity={isFoggy ? '0.6' : '0.35'} 
              />

              {/* Drag Handle Label */}
              <rect x="16" y="25" width="28" height="6.5" rx="2" fill="#0f172a" fillOpacity="0.9" />
              <text x="30" y="30" textAnchor="middle" fill="#e2e8f0" fontSize="5" fontWeight="bold">
                DRAG CAR
              </text>
            </g>

            {/* ========================================================================= */}
            {/* 2. FIXED ANATOMICALLY DETAILED HUMAN PEDESTRIAN SPRITE                   */}
            {/* ========================================================================= */}
            <g 
              id="sprite-pedestrian"
              transform={`translate(${pedestrianSvgX}, 184)`}
              className="cursor-grab active:cursor-grabbing transition-transform"
              onPointerDown={(e) => handlePointerDown('pedestrian', e)}
            >
              {/* Selection Box */}
              {selectedEntity === 'pedestrian' && (
                <rect x="-6" y="-2" width="28" height="56" rx="6" fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
              )}

              {/* PIR Target Label */}
              <text x="8" y="-4" textAnchor="middle" fill="#10b981" fontSize="6" fontWeight="bold" fontFamily="monospace">
                PEDESTRIAN (PIR)
              </text>

              {/* Ground Drop Shadow under feet */}
              <ellipse cx="8" cy="51" rx="9" ry="2.5" fill="#000000" opacity="0.4" />

              {/* Head with Beanie / Hair Profile */}
              <circle cx="8" cy="8" r="4.5" fill="#fed7aa" stroke="#f97316" strokeWidth="0.5" />
              {/* Beanie / Cap */}
              <path d="M 3.8,7 C 3.8,3.5 12.2,3.5 12.2,7 Z" fill="#0284c7" />
              <circle cx="8" cy="3" r="1" fill="#38bdf8" />
              {/* Face feature profile */}
              <circle cx="6.5" cy="8" r="0.6" fill="#7c2d12" />

              {/* Neck */}
              <rect x="7" y="12.2" width="2" height="2" fill="#fed7aa" />

              {/* Torso / Winter Jacket with Collar and Zipper */}
              <path 
                d="M 3.5,14 L 12.5,14 L 14,28 L 2,28 Z" 
                fill="url(#jacketGrad)" 
                stroke="#38bdf8" 
                strokeWidth="0.8" 
              />
              {/* Jacket Center Zipper line */}
              <line x1="8" y1="14" x2="8" y2="28" stroke="#0f172a" strokeWidth="0.8" />
              {/* Jacket Collar / Scarf */}
              <path d="M 4,14 Q 8,16.5 12,14" stroke="#f59e0b" strokeWidth="1.2" fill="none" />

              {/* Dynamic Walking Arms (Swings with walk step) */}
              <g>
                {/* Left Arm (Behind) */}
                <line 
                  x1="3.5" 
                  y1="15" 
                  x2={isWalkingPed ? (walkStep % 2 === 0 ? 0 : 7) : 2} 
                  y2="23" 
                  stroke="#0369a1" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                />
                {/* Right Arm (Foreground with Hand) */}
                <line 
                  x1="12.5" 
                  y1="15" 
                  x2={isWalkingPed ? (walkStep % 2 === 0 ? 15 : 9) : 14} 
                  y2="23" 
                  stroke="#0284c7" 
                  strokeWidth="2.4" 
                  strokeLinecap="round" 
                />
                <circle cx={isWalkingPed ? (walkStep % 2 === 0 ? 15 : 9) : 14} cy="23.5" r="1.2" fill="#fed7aa" />
              </g>

              {/* Dynamic Walking Legs & Shoes (Anatomical articulation) */}
              <g>
                {/* Left Leg (Striding back/forward) */}
                <line 
                  x1="5.5" 
                  y1="28" 
                  x2={isWalkingPed ? (walkStep % 2 === 0 ? 2 : 9) : 4} 
                  y2="46" 
                  stroke="url(#pantsGrad)" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                />
                {/* Left Shoe */}
                <rect 
                  x={isWalkingPed ? (walkStep % 2 === 0 ? -1 : 6) : 1} 
                  y="46" 
                  width="5.5" 
                  height="3" 
                  rx="1" 
                  fill="#ffffff" 
                  stroke="#475569" 
                  strokeWidth="0.6" 
                />

                {/* Right Leg (Striding forward/back) */}
                <line 
                  x1="10.5" 
                  y1="28" 
                  x2={isWalkingPed ? (walkStep % 2 === 0 ? 14 : 7) : 12} 
                  y2="46" 
                  stroke="url(#pantsGrad)" 
                  strokeWidth="2.8" 
                  strokeLinecap="round" 
                />
                {/* Right Shoe */}
                <rect 
                  x={isWalkingPed ? (walkStep % 2 === 0 ? 11 : 4) : 9} 
                  y="46" 
                  width="5.5" 
                  height="3" 
                  rx="1" 
                  fill="#ffffff" 
                  stroke="#475569" 
                  strokeWidth="0.6" 
                />
              </g>

              {/* Drag Handle Tag */}
              <rect x="-2" y="52" width="20" height="6.5" rx="2" fill="#0f172a" fillOpacity="0.9" />
              <text x="8" y="56.8" textAnchor="middle" fill="#10b981" fontSize="4.8" fontWeight="bold">
                HUMAN
              </text>
            </g>

            {/* ========================================================================= */}
            {/* 3. INTERACTIVE ANIMAL (CAT / DOG) SPRITE WITH PET IMMUNITY FILTER         */}
            {/* ========================================================================= */}
            {showAnimal && (
              <g 
                id="sprite-animal"
                transform={`translate(${animalSvgX}, 212)`}
                className="cursor-grab active:cursor-grabbing transition-transform"
                onPointerDown={(e) => handlePointerDown('animal', e)}
              >
                {selectedEntity === 'animal' && (
                  <rect x="-3" y="-6" width="34" height="34" rx="6" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                )}

                {/* Pet Immunity Classification Badge over Animal */}
                {light.animalDetected && (
                  <g transform="translate(14, -8)">
                    {light.petImmunityEnabled ? (
                      <g>
                        <rect x="-26" y="-8" width="52" height="8.5" rx="3" fill="#064e3b" stroke="#10b981" strokeWidth="0.8" />
                        <text x="0" y="-2" textAnchor="middle" fill="#a7f3d0" fontSize="5.2" fontWeight="bold">
                          FILTERED (PET IMMUNE)
                        </text>
                      </g>
                    ) : (
                      <g>
                        <rect x="-26" y="-8" width="52" height="8.5" rx="3" fill="#881337" stroke="#f43f5e" strokeWidth="0.8" />
                        <text x="0" y="-2" textAnchor="middle" fill="#fecdd3" fontSize="5.2" fontWeight="bold">
                          FALSE TRIGGER (+45W)
                        </text>
                      </g>
                    )}
                  </g>
                )}

                {/* Animal Body (Dog / Cat silhouette) */}
                <ellipse cx="14" cy="13" rx="9" ry="5.5" fill="#ea580c" />
                <circle cx="22" cy="8" r="4" fill="#ea580c" />
                <polygon points="20,4 22,1.5 23,4" fill="#c2410c" />
                <polygon points="23,4 25,1.5 26,4" fill="#c2410c" />
                <path d="M 4,11 Q 0,7 1,3" fill="none" stroke="#ea580c" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="8" y1="17" x2="8" y2="23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12" y2="23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="16" y1="17" x2="16" y2="23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />
                <line x1="19" y1="17" x2="19" y2="23" stroke="#c2410c" strokeWidth="1.8" strokeLinecap="round" />

                {/* Drag Label */}
                <rect x="4" y="23" width="20" height="6" rx="2" fill="#0f172a" fillOpacity="0.9" />
                <text x="14" y="27.5" textAnchor="middle" fill="#ea580c" fontSize="4.5" fontWeight="bold">
                  PET / CAT
                </text>
              </g>
            )}

          </svg>
        </div>

        {/* Legend & Corridor Telemetry Overlay */}
        <div className="absolute bottom-2 left-4 right-4 flex flex-wrap items-center justify-between text-[11px] text-slate-400 bg-slate-900/90 px-3 py-1.5 rounded-lg backdrop-blur-md border border-slate-800 z-25">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              5 Smart Poles Synced
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              PIR Human Detection
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              Pet Immunity Filter
            </span>
          </div>

          <div className="flex items-center gap-2 font-mono text-slate-300">
            <span>Corridor Active Load: <strong>{poles.reduce((acc, p) => acc + p.wattage, 0).toFixed(1)}W</strong></span>
          </div>
        </div>

      </div>

      {/* Sub-Panel Tabs: Corridor Wave Control, Movement Sliders, Fog Penetration, Pet Filter */}
      <div className="mt-4 pt-3 border-t border-slate-800 flex flex-col gap-3">
        
        {/* Navigation Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5 p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('corridor')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'corridor'
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>8-Pole Corridor Wave</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('move')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'move'
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MoveHorizontal className="w-3.5 h-3.5" />
              <span>Move Sprites (Car / Human / Pet)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weather')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'weather'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <CloudFog className="w-3.5 h-3.5 text-amber-400" />
              <span>Winter Fog Simulator</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('pet_filter')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-all ${
                activeTab === 'pet_filter'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Dog className="w-3.5 h-3.5 text-emerald-400" />
              <span>Pet Immunity Filter</span>
            </button>
          </div>

          <div className="text-xs text-slate-400 font-mono">
            <span>Roadway Span: <strong>240 meters (8 Poles)</strong></span>
          </div>
        </div>

        {/* Tab 1: Corridor Wave Controls */}
        {activeTab === 'corridor' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Corridor Wave Lighting & Node Orchestration
                </h3>
                <p className="text-[11px] text-slate-400">
                  As vehicles and pedestrians travel along the road, smart nodes exchange mesh telemetry to illuminate a forward safety wave.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setVehiclePosition(0);
                    setIsDrivingCar(true);
                  }}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Vehicle Drive Through</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPedestrianPosition(100);
                    setIsWalkingPed(true);
                  }}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-sm transition-all"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Simulate Pedestrian Walk</span>
                </button>
              </div>
            </div>

            {/* Quick Pole Status Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
              {poles.map((p, i) => (
                <div key={p.id} className="bg-slate-900/90 p-2 rounded-lg border border-slate-800 text-[11px]">
                  <div className="font-semibold text-slate-300">Pole #{i+1}</div>
                  <div className="text-[10px] text-slate-400 truncate">{p.name.split('(')[1]?.replace(')', '') || 'Corridor'}</div>
                  <div className="mt-1 font-mono font-bold text-amber-400">{p.intensity}% PWM</div>
                  <div className="text-[10px] text-slate-500">{p.wattage}W • {p.batterySoC}% SoC</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Movement Sliders */}
        {activeTab === 'move' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-4 animate-fadeIn">
            {/* Vehicle Position Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Car className="w-4 h-4 text-cyan-400" />
                  Car Position along Road (24GHz Doppler Radar)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setVehiclePosition(0);
                      setIsDrivingCar(true);
                    }}
                    className="px-2.5 py-1 bg-cyan-900/60 hover:bg-cyan-800 text-cyan-300 rounded border border-cyan-700/50 text-[11px] flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Auto Drive (0% → 100%)</span>
                  </button>
                  <span className="font-mono text-cyan-400 font-bold">{vehiclePosition}%</span>
                </div>
              </div>
              <input
                id="slider-vehicle-position"
                type="range"
                min="0"
                max="100"
                value={vehiclePosition}
                onChange={(e) => setVehiclePosition(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Pedestrian Position Slider */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-emerald-400" />
                  Pedestrian Position along Road (PIR Thermal Sensor)
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPedestrianPosition(100);
                      setIsWalkingPed(true);
                    }}
                    className="px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-800 text-emerald-300 rounded border border-emerald-700/50 text-[11px] flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Auto Walk (100% → 0%)</span>
                  </button>
                  <span className="font-mono text-emerald-400 font-bold">{pedestrianPosition}%</span>
                </div>
              </div>
              <input
                id="slider-pedestrian-position"
                type="range"
                min="0"
                max="100"
                value={pedestrianPosition}
                onChange={(e) => setPedestrianPosition(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Stray Animal Position Slider */}
            {showAnimal && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                    <Dog className="w-4 h-4 text-orange-400" />
                    Stray Animal Position (Pet Immunity Classifier)
                  </span>
                  <span className="font-mono text-orange-400 font-bold">{animalPosition}%</span>
                </div>
                <input
                  id="slider-animal-position"
                  type="range"
                  min="0"
                  max="100"
                  value={animalPosition}
                  onChange={(e) => setAnimalPosition(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                />
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Winter Fog Simulator */}
        {activeTab === 'weather' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <CloudFog className="w-4 h-4 text-amber-400" />
                  Winter Climate & Atmospheric Fog Visibility Penetration
                </h3>
                <p className="text-[11px] text-slate-400">
                  Dense winter fog scatters standard white light. Our optical beam shifts color temperature and increases lumens when vehicles pass.
                </p>
              </div>

              <button
                type="button"
                onClick={toggleWinterMode}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-all ${
                  light.isWinterMode
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                    : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                }`}
              >
                <Snowflake className="w-3.5 h-3.5 text-sky-400" />
                <span>{light.isWinterMode ? 'Winter Climate Mode: ON' : 'Toggle Winter Mode'}</span>
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300">Fog Density / Aerosol Scattering Level:</span>
                <span className="font-mono text-amber-400 font-bold">{light.fogDensity}%</span>
              </div>
              <input
                id="slider-fog-density"
                type="range"
                min="0"
                max="100"
                value={light.fogDensity}
                onChange={(e) => setFogDensity(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>
          </div>
        )}

        {/* Tab 4: Pet Filter */}
        {activeTab === 'pet_filter' && (
          <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col gap-3 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="max-w-md">
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                  <Dog className="w-4 h-4 text-emerald-400" />
                  Edge AI Pet Immunity & False-Trigger Elimination
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Standard PIR sensors falsely trigger 100% lighting for stray cats and dogs, wasting ~45W per event.
                  Pet Immunity analyzes Radar RCS (&lt;0.25 m²) and thermal differential to filter small animals.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={togglePetImmunity}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1.5 transition-all ${
                    light.petImmunityEnabled
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                      : 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  }`}
                >
                  {light.petImmunityEnabled ? (
                    <>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>Pet Immunity: ENABLED (Energy Protected)</span>
                    </>
                  ) : (
                    <>
                      <ShieldAlert className="w-4 h-4 text-rose-400" />
                      <span>Pet Immunity: DISABLED (Energy Wasted)</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={triggerAnimalMotion}
                  className="px-3 py-1.5 bg-orange-600/30 hover:bg-orange-600/50 text-orange-200 border border-orange-500/40 rounded-lg text-xs font-medium flex items-center gap-1.5"
                >
                  <Dog className="w-3.5 h-3.5" />
                  <span>Send Stray Animal Under Pole</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Avoided False Triggers</span>
                <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                  {light.petRejectionsCount} Events Filtered
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Energy Saved from Animal Filtering</span>
                <div className="text-lg font-bold font-mono text-cyan-400 mt-0.5">
                  +{(light.petRejectionsCount * 0.187).toFixed(2)} kWh
                </div>
              </div>
              <div className="bg-slate-900 p-3 rounded-lg border border-slate-800">
                <span className="text-[11px] text-slate-400">Radar Doppler RCS Classifier</span>
                <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                  &lt; 0.25 m² Target Threshold
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
