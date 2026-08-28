/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  AirQualityData,
  LightState,
  MicroGridState,
  TelemetryRecord,
  NodeAlert,
  NodeMetadata,
  LightingMode,
  PoleNode
} from '../types';
import { calculatePM25AQI } from '../utils/aqiCalculator';

interface StreetlightContextType {
  // States
  light: LightState;
  airQuality: AirQualityData;
  microGrid: MicroGridState;
  metadata: NodeMetadata;
  history: TelemetryRecord[];
  alerts: NodeAlert[];
  isStreaming: boolean;
  simulationSpeed: number;

  // Multi-Pole Network (5 Smart Poles along Corridor)
  poles: PoleNode[];
  selectedPoleId: string;
  setSelectedPoleId: (id: string) => void;

  // Interactive Sprites & Positions (0-100% along road)
  vehiclePosition: number;
  pedestrianPosition: number;
  animalPosition: number;
  showAnimal: boolean;

  // Radar metrics
  radarSpeedKmh: number;
  radarDistanceM: number;

  // Actions
  setLightIntensity: (intensity: number) => void;
  setLightingMode: (mode: LightingMode) => void;
  setIdleIntensity: (pct: number) => void;
  setActiveIntensity: (pct: number) => void;
  setHoldTimeout: (seconds: number) => void;
  triggerPedestrianMotion: () => void;
  triggerVehicleMotion: () => void;
  triggerAnimalMotion: () => void;
  setVehiclePosition: (pos: number | ((prev: number) => number)) => void;
  setPedestrianPosition: (pos: number | ((prev: number) => number)) => void;
  setAnimalPosition: (pos: number | ((prev: number) => number)) => void;
  setShowAnimal: (show: boolean) => void;
  togglePetImmunity: () => void;
  setFogDensity: (density: number) => void;
  toggleWinterMode: () => void;
  setDayNight: (isNight: boolean) => void;
  setAirQualityManual: (readings: Partial<AirQualityData>) => void;
  simulateAirPollutionSpike: (type: 'exhaust' | 'wildfire' | 'dust' | 'clean') => void;
  setWeatherPreset: (preset: 'sunny' | 'overcast' | 'storm' | 'night' | 'winter_fog') => void;
  toggleGridFallback: () => void;
  toggleStreaming: () => void;
  setSimulationSpeed: (speed: number) => void;
  dismissAlert: (id: string) => void;
  clearAlerts: () => void;
  resetAll: () => void;
}

const initialMetadata: NodeMetadata = {
  nodeId: 'NODE-SF-8042',
  nodeName: 'Mission Blvd & 16th St Node #04',
  location: 'San Francisco, CA (Zone 4B)',
  coordinates: { lat: 37.7651, lng: -122.4194 },
  firmware: 'v2.4.1-edge-mbed',
  connectivity: 'NB-IoT',
  signalRssi: -72,
  uptimeSeconds: 142850
};

const initialAirQuality: AirQualityData = {
  pm25: 14.8,
  pm10: 26.3,
  co2: 435,
  voc: 165,
  no2: 24.1,
  co: 0.65,
  aqi: 56,
  aqiCategory: 'Moderate',
  aqiColor: '#eab308',
  temperatureC: 19.4,
  humidityPct: 62.0,
  pressureHpa: 1014.2,
  lastUpdated: new Date().toLocaleTimeString()
};

const initialLight: LightState = {
  intensity: 25,
  targetIntensity: 25,
  mode: 'auto',
  motionDetected: false,
  presenceDurationSec: 0,
  prolongedPresenceActive: false,
  radarTriggered: false,
  pirTriggered: false,
  animalDetected: false,
  animalFiltered: false,
  petImmunityEnabled: true,
  petRejectionsCount: 3,
  fogDensity: 0,
  isWinterMode: false,
  fogPenetrationActive: false,
  ambientLux: 4.2,
  isNightTime: true,
  idleIntensity: 25,
  activeIntensity: 100,
  holdTimeoutSec: 15,
  holdRemainingSec: 0,
  currentWattage: 15.0, // 25% of 60W
  conventionalWattage: 60.0,
  accumulatedEnergySavedWh: 412.5
};

const initialMicroGrid: MicroGridState = {
  solarVoltage: 0.2,
  solarCurrent: 0.0,
  solarPower: 0.0,
  batterySoC: 84.5,
  batteryVoltage: 13.1,
  batteryCurrent: -1.2,
  batteryTempC: 22.8,
  chargingState: 'discharging',
  gridFallbackActive: false,
  dailySolarYieldWh: 780,
  dailyGridConsumptionWh: 0
};

const StreetlightContext = createContext<StreetlightContextType | undefined>(undefined);

export const StreetlightProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [metadata, setMetadata] = useState<NodeMetadata>(initialMetadata);
  const [light, setLight] = useState<LightState>(initialLight);
  const [airQuality, setAirQuality] = useState<AirQualityData>(() => {
    const { aqi, category, color } = calculatePM25AQI(initialAirQuality.pm25);
    return { ...initialAirQuality, aqi, aqiCategory: category, aqiColor: color };
  });
  const [microGrid, setMicroGrid] = useState<MicroGridState>(initialMicroGrid);
  
  // Interactive entity positions along the road (0 to 100%)
  const [vehiclePosition, setVehiclePositionState] = useState<number>(12);
  const [pedestrianPosition, setPedestrianPositionState] = useState<number>(88);
  const [animalPosition, setAnimalPositionState] = useState<number>(28);
  const [showAnimal, setShowAnimal] = useState<boolean>(true);

  const [alerts, setAlerts] = useState<NodeAlert[]>([
    {
      id: 'alt-init-1',
      timestamp: new Date(Date.now() - 120000).toLocaleTimeString(),
      level: 'info',
      category: 'lighting',
      title: 'Adaptive Dimming Active',
      description: 'Dusk threshold triggered. Idle power reduced to 25% (15W).'
    },
    {
      id: 'alt-init-2',
      timestamp: new Date(Date.now() - 60000).toLocaleTimeString(),
      level: 'info',
      category: 'sensor',
      title: 'Pet Immunity Classifier Armed',
      description: 'Multi-tier PIR/Radar filters animals (<0.25m² RCS) to prevent false-positive energy loss.'
    }
  ]);
  const [isStreaming, setIsStreaming] = useState(true);
  const [simulationSpeed, setSimulationSpeed] = useState(1);

  // Multi-pole corridor selection (Pole 1 through 5)
  const [selectedPoleId, setSelectedPoleId] = useState<string>('pole-3');
  const [radarSpeedKmh, setRadarSpeedKmh] = useState<number>(0);

  // Generate initial history with all feature data points
  const [history, setHistory] = useState<TelemetryRecord[]>(() => {
    const records: TelemetryRecord[] = [];
    const now = Date.now();
    for (let i = 24; i >= 0; i--) {
      const time = new Date(now - i * 10000);
      const pm25Val = +(12 + Math.sin(i * 0.4) * 5 + Math.random() * 4).toFixed(1);
      const pm10Val = +(24 + Math.sin(i * 0.4) * 8 + Math.random() * 6).toFixed(1);
      const co2Val = Math.round(420 + Math.cos(i * 0.3) * 60 + Math.random() * 30);
      const vocVal = Math.round(140 + Math.sin(i * 0.5) * 40 + Math.random() * 20);
      const aqiRes = calculatePM25AQI(pm25Val);
      const isMotion = i % 8 === 0;
      const intensity = isMotion ? 100 : 25;

      records.push({
        id: `rec-${i}`,
        timestamp: time.toISOString(),
        timeLabel: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        lightIntensity: intensity,
        wattage: +(intensity * 0.6).toFixed(1),
        pm25: pm25Val,
        pm10: pm10Val,
        co2: co2Val,
        voc: vocVal,
        aqi: aqiRes.aqi,
        batterySoC: +(85 - i * 0.1).toFixed(1),
        solarPower: 0,
        batteryCurrent: -1.2,
        batteryTempC: +(22 + Math.sin(i * 0.2) * 1.5).toFixed(1),
        motionEvent: isMotion,
        petRejectionEvents: Math.max(0, Math.floor((24 - i) / 5)),
        fogDensity: 0,
        radarSpeedKmh: isMotion ? 42 : 0,
        radarDistanceM: +(Math.abs(30 - (i % 10) * 6)).toFixed(1),
        poleIntensities: [25, isMotion ? 100 : 25, isMotion ? 100 : 25, 25, 25, 25, 25, 25]
      });
    }
    return records;
  });

  // Motion hold timer ref
  const holdTimerRef = useRef<NodeJS.Timeout | null>(null);
  const presenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger alert helper
  const addAlert = useCallback((level: NodeAlert['level'], category: NodeAlert['category'], title: string, description: string) => {
    const newAlert: NodeAlert = {
      id: `alt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toLocaleTimeString(),
      level,
      category,
      title,
      description
    };
    setAlerts(prev => [newAlert, ...prev.slice(0, 19)]);
  }, []);

  // Update light wattage whenever intensity changes (Max 60W LED luminaire)
  useEffect(() => {
    const targetWatts = (light.intensity / 100) * 60;
    setLight(prev => ({
      ...prev,
      currentWattage: +targetWatts.toFixed(1)
    }));
  }, [light.intensity]);

  // Handle Motion triggers (Pedestrian / Vehicle / Animal)
  const triggerMotionInternal = useCallback((type: 'pedestrian' | 'vehicle') => {
    if (presenceTimerRef.current) clearInterval(presenceTimerRef.current);

    setLight(prev => {
      const isNight = prev.isNightTime;
      const mode = prev.mode;
      const isAutoOrEco = mode === 'auto' || mode === 'eco';
      const isFoggy = prev.fogDensity >= 30 || prev.isWinterMode;
      const targetIntensity = isNight && isAutoOrEco ? prev.activeIntensity : prev.intensity;

      return {
        ...prev,
        motionDetected: true,
        presenceDurationSec: 0,
        prolongedPresenceActive: false,
        pirTriggered: type === 'pedestrian',
        radarTriggered: type === 'vehicle',
        fogPenetrationActive: isFoggy && isNight,
        animalDetected: false,
        animalFiltered: false,
        targetIntensity,
        intensity: targetIntensity,
        holdRemainingSec: prev.holdTimeoutSec
      };
    });

    const isFog = light.fogDensity >= 30 || light.isWinterMode;
    if (type === 'vehicle') {
      if (isFog) {
        addAlert(
          'warning',
          'lighting',
          'Winter Fog Penetration Engaged',
          'Vehicle approaching in dense fog. Luminaire boosted to 100% with high-penetration amber-shifted optical beam.'
        );
      } else {
        addAlert(
          'info',
          'lighting',
          'Vehicle Radar Detected',
          '24GHz Doppler radar triggered. Smart node illuminated to 100% brightness for 15s.'
        );
      }
    } else {
      addAlert(
        'info',
        'lighting',
        'Pedestrian Motion Detected',
        'PIR thermal sensor detected human movement. Ramp hold active for 15s.'
      );
    }

    if (holdTimerRef.current) clearInterval(holdTimerRef.current);

    holdTimerRef.current = setInterval(() => {
      setLight(prev => {
        if (prev.holdRemainingSec <= 1) {
          if (holdTimerRef.current) clearInterval(holdTimerRef.current);
          const returnIntensity = prev.mode === 'auto' || prev.mode === 'eco' 
            ? (prev.isNightTime ? prev.idleIntensity : 0) 
            : prev.intensity;
          if (prev.prolongedPresenceActive) {
            return {
              ...prev,
              motionDetected: false,
              radarTriggered: false,
              pirTriggered: false,
              fogPenetrationActive: false,
              holdRemainingSec: 0
            };
          }
          return {
            ...prev,
            motionDetected: false,
            radarTriggered: false,
            pirTriggered: false,
            fogPenetrationActive: false,
            holdRemainingSec: 0,
            targetIntensity: returnIntensity,
            intensity: returnIntensity
          };
        }
        return {
          ...prev,
          holdRemainingSec: prev.holdRemainingSec - 1
        };
      });
    }, 1000);

    presenceTimerRef.current = setInterval(() => {
      setLight(prev => {
        if (prev.prolongedPresenceActive || prev.presenceDurationSec >= 30) {
          if (presenceTimerRef.current) clearInterval(presenceTimerRef.current);
          return {
            ...prev,
            presenceDurationSec: 30,
            prolongedPresenceActive: true,
            targetIntensity: 40,
            intensity: 40
          };
        }

        const duration = prev.presenceDurationSec + 1;
        if (duration >= 30) {
          addAlert(
            'info',
            'lighting',
            'Prolonged Presence Dimming Active',
            `${type === 'vehicle' ? 'Vehicle' : 'Person'} remained under the light for 30s. Output reduced to 40%.`
          );
          if (presenceTimerRef.current) clearInterval(presenceTimerRef.current);
          return {
            ...prev,
            presenceDurationSec: 30,
            prolongedPresenceActive: true,
            targetIntensity: 40,
            intensity: 40
          };
        }

        return { ...prev, presenceDurationSec: duration };
      });
    }, 1000);
  }, [addAlert, light.fogDensity, light.isWinterMode]);

  useEffect(() => () => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (presenceTimerRef.current) clearInterval(presenceTimerRef.current);
  }, []);

  const triggerPedestrianMotion = useCallback(() => {
    setPedestrianPositionState(50);
    triggerMotionInternal('pedestrian');
  }, [triggerMotionInternal]);

  const triggerVehicleMotion = useCallback(() => {
    setVehiclePositionState(52);
    triggerMotionInternal('vehicle');
  }, [triggerMotionInternal]);

  // Animal trigger handler: demonstrates pet immunity algorithm
  const triggerAnimalMotion = useCallback(() => {
    setAnimalPositionState(50);
    setLight(prev => {
      if (prev.petImmunityEnabled) {
        // Pet Immunity is ON -> Rejects animal, keeps light at idle!
        return {
          ...prev,
          animalDetected: true,
          animalFiltered: true,
          petRejectionsCount: prev.petRejectionsCount + 1
        };
      } else {
        // Pet Immunity is OFF -> Naive sensor false triggers 100% light!
        const isNight = prev.isNightTime;
        const targetIntensity = isNight ? prev.activeIntensity : prev.intensity;
        return {
          ...prev,
          animalDetected: true,
          animalFiltered: false,
          motionDetected: true,
          pirTriggered: true,
          targetIntensity,
          intensity: targetIntensity,
          holdRemainingSec: prev.holdTimeoutSec
        };
      }
    });

    if (light.petImmunityEnabled) {
      addAlert(
        'info',
        'sensor',
        'Pet Immunity: Animal Filtered',
        'Small animal (Cat/Dog) detected under sensor (<0.25m² RCS / low thermal mass). False trigger filtered, saving 45W of electricity!'
      );
    } else {
      addAlert(
        'warning',
        'lighting',
        'False Trigger: Animal Detected',
        'Pet Immunity is disabled! Luminaire ramped to 100% for a stray animal, resulting in electricity waste.'
      );
    }
  }, [addAlert, light.petImmunityEnabled]);

  // Compute 8 Smart Poles along the street corridor
  const defaultPolesConfig = [
    { id: 'pole-1', name: 'Pole #01 (West Ingress)', positionPct: 8, baseSoC: 86.4 },
    { id: 'pole-2', name: 'Pole #02 (West Transit)', positionPct: 20, baseSoC: 85.8 },
    { id: 'pole-3', name: 'Pole #03 (Transit Lane A)', positionPct: 32, baseSoC: 85.1 },
    { id: 'pole-4', name: 'Pole #04 (Central Hub)', positionPct: 44, baseSoC: 84.5 },
    { id: 'pole-5', name: 'Pole #05 (Civic Crossing)', positionPct: 56, baseSoC: 84.2 },
    { id: 'pole-6', name: 'Pole #06 (Transit Lane B)', positionPct: 68, baseSoC: 83.8 },
    { id: 'pole-7', name: 'Pole #07 (East Transit)', positionPct: 80, baseSoC: 85.4 },
    { id: 'pole-8', name: 'Pole #08 (East Egress)', positionPct: 92, baseSoC: 87.0 }
  ];

  const poles: PoleNode[] = defaultPolesConfig.map((pCfg, idx) => {
    // Proximity to vehicle, pedestrian, animal
    const dVeh = Math.abs(vehiclePosition - pCfg.positionPct);
    const dPed = Math.abs(pedestrianPosition - pCfg.positionPct);
    const dAnimal = Math.abs(animalPosition - pCfg.positionPct);

    // Wave / Radar trigger (within 13% or approaching within 18%)
    const radarTriggered = dVeh <= 13 || (vehiclePosition < pCfg.positionPct && (pCfg.positionPct - vehiclePosition) <= 18);
    const pirTriggered = dPed <= 10;
    const animalDetected = dAnimal <= 9;
    const animalFiltered = animalDetected && light.petImmunityEnabled;
    const animalFalseTrigger = animalDetected && !light.petImmunityEnabled;

    const motionDetected = radarTriggered || pirTriggered || animalFalseTrigger;
    const isFoggy = light.fogDensity >= 30 || light.isWinterMode;
    const fogPenetrationActive = isFoggy && motionDetected && light.isNightTime;

    const prolongedPresenceAtPole = light.prolongedPresenceActive && (radarTriggered || pirTriggered);
    let poleIntensity = light.idleIntensity;
    if (!light.isNightTime) {
      poleIntensity = 0;
    } else if (motionDetected) {
      poleIntensity = prolongedPresenceAtPole ? 40 : light.activeIntensity;
    } else if (animalFiltered) {
      poleIntensity = light.idleIntensity;
    }

    const wattage = +( (poleIntensity / 100) * 60 ).toFixed(1);

    return {
      id: pCfg.id,
      name: pCfg.name,
      positionPct: pCfg.positionPct,
      intensity: poleIntensity,
      wattage,
      motionDetected,
      radarTriggered,
      pirTriggered,
      animalDetected,
      animalFiltered,
      fogPenetrationActive,
      batterySoC: +(pCfg.baseSoC + (idx === 3 ? microGrid.batterySoC - 84.5 : 0)).toFixed(1),
      solarPower: microGrid.solarPower,
      ambientLux: light.ambientLux,
      holdRemainingSec: motionDetected ? light.holdRemainingSec : 0
    };
  });

  // Calculate real-time Radar Doppler metrics
  const selectedPole = poles.find(p => p.id === selectedPoleId) || poles[3];
  const radarDistanceM = +(Math.abs(vehiclePosition - selectedPole.positionPct) * 1.5).toFixed(1);

  // Set position with real-time zone detection
  const setVehiclePosition = useCallback((posOrFn: number | ((prev: number) => number)) => {
    setVehiclePositionState(prev => {
      const next = typeof posOrFn === 'function' ? posOrFn(prev) : posOrFn;
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      const delta = Math.abs(clamped - prev);
      if (delta > 0) {
        setRadarSpeedKmh(Math.min(75, Math.round(delta * 22)));
      }
      return clamped;
    });

    // Check if vehicle triggered active pole
    if (vehiclePosition >= 30 && vehiclePosition <= 70) {
      if (!light.radarTriggered) {
        triggerMotionInternal('vehicle');
      }
    }
  }, [vehiclePosition, light.radarTriggered, triggerMotionInternal]);

  const setPedestrianPosition = useCallback((posOrFn: number | ((prev: number) => number)) => {
    setPedestrianPositionState(prev => {
      const next = typeof posOrFn === 'function' ? posOrFn(prev) : posOrFn;
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      return clamped;
    });

    if (pedestrianPosition >= 35 && pedestrianPosition <= 65) {
      if (!light.pirTriggered) {
        triggerMotionInternal('pedestrian');
      }
    }
  }, [pedestrianPosition, light.pirTriggered, triggerMotionInternal]);

  const setAnimalPosition = useCallback((posOrFn: number | ((prev: number) => number)) => {
    setAnimalPositionState(prev => {
      const next = typeof posOrFn === 'function' ? posOrFn(prev) : posOrFn;
      const clamped = Math.max(0, Math.min(100, Math.round(next)));
      return clamped;
    });

    if (animalPosition >= 36 && animalPosition <= 64) {
      if (!light.animalDetected) {
        triggerAnimalMotion();
      }
    } else {
      setLight(prev => ({
        ...prev,
        animalDetected: false,
        animalFiltered: false
      }));
    }
  }, [animalPosition, light.animalDetected, triggerAnimalMotion]);

  const togglePetImmunity = useCallback(() => {
    setLight(prev => {
      const next = !prev.petImmunityEnabled;
      addAlert(
        next ? 'info' : 'warning',
        'sensor',
        next ? 'Pet Immunity Filter Enabled' : 'Pet Immunity Disabled',
        next 
          ? 'Edge AI signature thresholding active: Stray animals, cats, and dogs will be ignored to conserve energy.'
          : 'Filter bypassed: Any small thermal/radar signature will trigger full streetlight power.'
      );
      return {
        ...prev,
        petImmunityEnabled: next
      };
    });
  }, [addAlert]);

  const setFogDensity = useCallback((density: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(density)));
    setLight(prev => {
      const isFoggy = clamped >= 30;
      const isNight = prev.isNightTime;
      const hasMotion = prev.motionDetected || prev.radarTriggered;
      const fogPenetrationActive = isFoggy && hasMotion && isNight;

      return {
        ...prev,
        fogDensity: clamped,
        fogPenetrationActive
      };
    });

    if (clamped >= 50) {
      addAlert(
        'warning',
        'lighting',
        `Dense Winter Fog (${clamped}%)`,
        'Atmospheric optical scattering high. Smart pole armed with fog-penetrating high-visibility optical beam for passing vehicles.'
      );
    }
  }, [addAlert]);

  const toggleWinterMode = useCallback(() => {
    setLight(prev => {
      const nextWinter = !prev.isWinterMode;
      const newFog = nextWinter ? Math.max(prev.fogDensity, 65) : 0;
      addAlert(
        'info',
        'lighting',
        nextWinter ? 'Winter Climate Profile Active' : 'Standard Season Profile',
        nextWinter 
          ? 'Winter fog & reduced visibility protocol active. Light output automatically adapts with anti-scatter penetration when vehicles transit.'
          : 'Normal atmospheric conditions restored.'
      );
      return {
        ...prev,
        isWinterMode: nextWinter,
        fogDensity: newFog,
        fogPenetrationActive: nextWinter && prev.motionDetected
      };
    });
  }, [addAlert]);

  // Set Light Intensity directly (0-100%)
  const setLightIntensity = useCallback((intensity: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(intensity)));
    setLight(prev => ({
      ...prev,
      intensity: clamped,
      targetIntensity: clamped
    }));
  }, []);

  const setLightingMode = useCallback((mode: LightingMode) => {
    setLight(prev => {
      let target = prev.intensity;
      if (mode === 'eco') {
        target = prev.isNightTime ? 15 : 0;
      } else if (mode === 'auto') {
        target = prev.isNightTime ? (prev.motionDetected ? prev.activeIntensity : prev.idleIntensity) : 0;
      } else if (mode === 'emergency') {
        target = 100;
      }
      return {
        ...prev,
        mode,
        intensity: target,
        targetIntensity: target
      };
    });
    addAlert('info', 'lighting', `Mode Switch: ${mode.toUpperCase()}`, `Streetlight operating profile updated to ${mode} mode.`);
  }, [addAlert]);

  const setIdleIntensity = useCallback((pct: number) => {
    const clamped = Math.max(0, Math.min(60, Math.round(pct)));
    setLight(prev => ({
      ...prev,
      idleIntensity: clamped,
      intensity: (!prev.motionDetected && prev.isNightTime && prev.mode === 'auto') ? clamped : prev.intensity
    }));
  }, []);

  const setActiveIntensity = useCallback((pct: number) => {
    const clamped = Math.max(50, Math.min(100, Math.round(pct)));
    setLight(prev => ({
      ...prev,
      activeIntensity: clamped,
      intensity: (prev.motionDetected && prev.mode === 'auto') ? clamped : prev.intensity
    }));
  }, []);

  const setHoldTimeout = useCallback((seconds: number) => {
    setLight(prev => ({
      ...prev,
      holdTimeoutSec: Math.max(5, Math.min(120, seconds))
    }));
  }, []);

  const setDayNight = useCallback((isNight: boolean) => {
    setLight(prev => {
      const ambientLux = isNight ? 2.5 : 850;
      let newIntensity = prev.intensity;
      if (prev.mode === 'auto' || prev.mode === 'eco') {
        newIntensity = isNight ? (prev.motionDetected ? prev.activeIntensity : prev.idleIntensity) : 0;
      }
      return {
        ...prev,
        isNightTime: isNight,
        ambientLux,
        intensity: newIntensity,
        targetIntensity: newIntensity
      };
    });

    setMicroGrid(prev => {
      const solarPower = isNight ? 0 : 68.5;
      const solarVoltage = isNight ? 0.2 : 18.6;
      const solarCurrent = isNight ? 0 : +(solarPower / solarVoltage).toFixed(2);
      const batteryCurrent = isNight ? -1.4 : +3.2;
      const chargingState = isNight ? 'discharging' : 'bulk';
      return {
        ...prev,
        solarPower,
        solarVoltage,
        solarCurrent,
        batteryCurrent,
        chargingState
      };
    });

    addAlert('info', 'lighting', isNight ? 'Dusk Detected' : 'Dawn Detected', isNight ? 'Ambient lux dropped below 10 lux. Arming luminaire driver.' : 'Daylight detected (>500 lux). Disarming street lighting.');
  }, [addAlert]);

  // Set Air quality manually
  const setAirQualityManual = useCallback((readings: Partial<AirQualityData>) => {
    setAirQuality(prev => {
      const nextPm25 = readings.pm25 !== undefined ? readings.pm25 : prev.pm25;
      const { aqi, category, color } = calculatePM25AQI(nextPm25);
      return {
        ...prev,
        ...readings,
        pm25: nextPm25,
        aqi,
        aqiCategory: category,
        aqiColor: color,
        lastUpdated: new Date().toLocaleTimeString()
      };
    });
  }, []);

  // Simulate pollution spike scenarios
  const simulateAirPollutionSpike = useCallback((type: 'exhaust' | 'wildfire' | 'dust' | 'clean') => {
    let pm25 = 12.0;
    let pm10 = 22.0;
    let co2 = 420;
    let voc = 140;
    let no2 = 18.0;
    let co = 0.4;
    let title = 'Clean Air Baseline';
    let desc = 'Atmospheric conditions restored to clean coastal air.';
    let level: NodeAlert['level'] = 'info';

    if (type === 'exhaust') {
      pm25 = 68.4;
      pm10 = 94.0;
      co2 = 1150;
      voc = 620;
      no2 = 78.5;
      co = 3.8;
      title = 'Vehicle Exhaust Spike';
      desc = 'Heavy diesel exhaust detected at intersection. Elevated NO2 and particulate matter.';
      level = 'warning';
    } else if (type === 'wildfire') {
      pm25 = 168.2;
      pm10 = 245.0;
      co2 = 820;
      voc = 480;
      no2 = 35.0;
      co = 2.4;
      title = 'Wildfire Smoke Inversion';
      desc = 'Extreme PM2.5 particulate concentration exceeding 150 µg/m³. AQI entering Unhealthy range.';
      level = 'critical';
    } else if (type === 'dust') {
      pm25 = 38.0;
      pm10 = 185.0;
      co2 = 460;
      voc = 190;
      no2 = 22.0;
      co = 0.5;
      title = 'Urban Dust / Construction Plume';
      desc = 'High PM10 coarse particulate matter detected near road surface.';
      level = 'warning';
    }

    const { aqi, category, color } = calculatePM25AQI(pm25);

    setAirQuality({
      pm25,
      pm10,
      co2,
      voc,
      no2,
      co,
      aqi,
      aqiCategory: category,
      aqiColor: color,
      temperatureC: 21.2,
      humidityPct: 54,
      pressureHpa: 1013.8,
      lastUpdated: new Date().toLocaleTimeString()
    });

    addAlert(level, 'air_quality', title, desc);
  }, [addAlert]);

  // Weather presets
  const setWeatherPreset = useCallback((preset: 'sunny' | 'overcast' | 'storm' | 'night' | 'winter_fog') => {
    if (preset === 'night') {
      setDayNight(true);
      setLight(prev => ({ ...prev, fogDensity: 0, isWinterMode: false }));
      return;
    }

    if (preset === 'winter_fog') {
      setDayNight(true);
      setLight(prev => ({ ...prev, fogDensity: 75, isWinterMode: true }));
      setAirQualityManual({ temperatureC: 2.1, humidityPct: 92 });
      addAlert('warning', 'lighting', 'Winter Fog Mode Activated', 'Dense winter fog simulated. Streetlight armed with fog penetration optics when vehicles pass.');
      return;
    }

    setDayNight(false);
    setLight(prev => ({ ...prev, fogDensity: 0, isWinterMode: false }));
    setMicroGrid(prev => {
      let solarPower = 72;
      let solarVoltage = 19.2;
      let chargingState: MicroGridState['chargingState'] = 'bulk';
      if (preset === 'overcast') {
        solarPower = 28;
        solarVoltage = 15.4;
        chargingState = 'absorption';
      } else if (preset === 'storm') {
        solarPower = 8.5;
        solarVoltage = 12.8;
        chargingState = 'float';
      }

      return {
        ...prev,
        solarPower,
        solarVoltage,
        solarCurrent: +(solarPower / solarVoltage).toFixed(2),
        batteryCurrent: +(solarPower / 13.2).toFixed(2),
        chargingState
      };
    });

    addAlert('info', 'microgrid', `Weather Profile: ${preset.toUpperCase()}`, `Solar irradiance updated. Estimated PV generation: ${preset === 'sunny' ? '72W' : preset === 'overcast' ? '28W' : '8.5W'}.`);
  }, [setDayNight, setAirQualityManual, addAlert]);

  const toggleGridFallback = useCallback(() => {
    setMicroGrid(prev => {
      const next = !prev.gridFallbackActive;
      addAlert(
        next ? 'warning' : 'info',
        'microgrid',
        next ? 'Grid Fallback Engaged' : 'Grid Fallback Disengaged',
        next ? 'Battery reserves low or manual override active. Drawing supplementary power from municipal AC grid.' : 'Node operating 100% autonomously from solar storage.'
      );
      return { ...prev, gridFallbackActive: next };
    });
  }, [addAlert]);

  const toggleStreaming = useCallback(() => {
    setIsStreaming(prev => !prev);
  }, []);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const resetAll = useCallback(() => {
    if (holdTimerRef.current) clearInterval(holdTimerRef.current);
    if (presenceTimerRef.current) clearInterval(presenceTimerRef.current);
    setLight(initialLight);
    const { aqi, category, color } = calculatePM25AQI(initialAirQuality.pm25);
    setAirQuality({ ...initialAirQuality, aqi, aqiCategory: category, aqiColor: color });
    setMicroGrid(initialMicroGrid);
    setMetadata(initialMetadata);
    setVehiclePositionState(12);
    setPedestrianPositionState(88);
    setAnimalPositionState(28);
    setShowAnimal(true);
    setAlerts([]);
    addAlert('info', 'lighting', 'System Reset', 'All node registers and sensors reset to factory defaults.');
  }, [addAlert]);

  // Main Live Simulation Tick Loop (Every 2s scaled by simulationSpeed)
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // 1. Natural micro-jitter for Air Quality (PM2.5, CO2, VOCs)
      setAirQuality(prev => {
        const pm25Noise = (Math.random() - 0.49) * 0.8;
        const newPm25 = Math.max(2, +(prev.pm25 + pm25Noise).toFixed(1));
        
        const co2Noise = Math.round((Math.random() - 0.48) * 6);
        const newCo2 = Math.max(380, Math.min(2500, prev.co2 + co2Noise));

        const vocNoise = Math.round((Math.random() - 0.48) * 4);
        const newVoc = Math.max(50, Math.min(1500, prev.voc + vocNoise));

        const { aqi, category, color } = calculatePM25AQI(newPm25);

        return {
          ...prev,
          pm25: newPm25,
          co2: newCo2,
          voc: newVoc,
          aqi,
          aqiCategory: category,
          aqiColor: color,
          lastUpdated: new Date().toLocaleTimeString()
        };
      });

      // 2. Microgrid dynamic battery SoC & Energy Saved accumulation
      setLight(prev => {
        // 60W baseline vs actual wattage: saved power = 60 - wattage
        const savedPowerWatts = Math.max(0, prev.conventionalWattage - prev.currentWattage);
        // In 2 seconds: energy in Wh = watts * (2 / 3600)
        const savedWhDelta = savedPowerWatts * (2 / 3600);
        return {
          ...prev,
          accumulatedEnergySavedWh: +(prev.accumulatedEnergySavedWh + savedWhDelta).toFixed(3)
        };
      });

      setMicroGrid(prev => {
        // Battery SoC drain / charge calculation
        let socDelta = 0;
        if (prev.chargingState === 'bulk' || prev.chargingState === 'absorption') {
          socDelta = 0.02 * (prev.solarPower / 50);
        } else if (prev.chargingState === 'discharging') {
          socDelta = -0.015 * (light.currentWattage / 30);
        }
        const newSoC = Math.max(5, Math.min(100, +(prev.batterySoC + socDelta).toFixed(2)));

        return {
          ...prev,
          batterySoC: newSoC,
          batteryVoltage: +(11.8 + (newSoC / 100) * 1.8).toFixed(2)
        };
      });

      // 3. Append to telemetry history (keep last 30 points)
      setHistory(prev => {
        const now = new Date();
        const currentLightWatts = (light.intensity / 100) * 60;
        const newRecord: TelemetryRecord = {
          id: `rec-${Date.now()}`,
          timestamp: now.toISOString(),
          timeLabel: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          lightIntensity: light.intensity,
          wattage: +currentLightWatts.toFixed(1),
          pm25: airQuality.pm25,
          pm10: airQuality.pm10,
          co2: airQuality.co2,
          voc: airQuality.voc,
          aqi: airQuality.aqi,
          batterySoC: microGrid.batterySoC,
          solarPower: microGrid.solarPower,
          batteryCurrent: microGrid.batteryCurrent,
          batteryTempC: microGrid.batteryTempC,
          motionEvent: light.motionDetected,
          petRejectionEvents: light.petRejectionsCount,
          fogDensity: light.fogDensity,
          radarSpeedKmh: radarSpeedKmh,
          radarDistanceM: radarDistanceM,
          poleIntensities: poles.map(p => p.intensity)
        };
        return [...prev.slice(1), newRecord];
      });

      // 4. Update node uptime
      setMetadata(prev => ({
        ...prev,
        uptimeSeconds: prev.uptimeSeconds + 2
      }));

    }, Math.max(400, 2000 / simulationSpeed));

    return () => clearInterval(interval);
  }, [isStreaming, simulationSpeed, light.intensity, light.conventionalWattage, light.currentWattage, light.motionDetected, light.petRejectionsCount, light.fogDensity, airQuality.pm25, airQuality.pm10, airQuality.co2, airQuality.voc, airQuality.aqi, microGrid.batterySoC, microGrid.solarPower, microGrid.batteryCurrent, microGrid.batteryTempC, radarSpeedKmh, radarDistanceM, poles]);

  return (
    <StreetlightContext.Provider
      value={{
        light,
        airQuality,
        microGrid,
        metadata,
        history,
        alerts,
        isStreaming,
        simulationSpeed,
        poles,
        selectedPoleId,
        setSelectedPoleId,
        vehiclePosition,
        pedestrianPosition,
        animalPosition,
        showAnimal,
        radarSpeedKmh,
        radarDistanceM,
        setLightIntensity,
        setLightingMode,
        setIdleIntensity,
        setActiveIntensity,
        setHoldTimeout,
        triggerPedestrianMotion,
        triggerVehicleMotion,
        triggerAnimalMotion,
        setVehiclePosition,
        setPedestrianPosition,
        setAnimalPosition,
        setShowAnimal,
        togglePetImmunity,
        setFogDensity,
        toggleWinterMode,
        setDayNight,
        setAirQualityManual,
        simulateAirPollutionSpike,
        setWeatherPreset,
        toggleGridFallback,
        toggleStreaming,
        setSimulationSpeed,
        dismissAlert,
        clearAlerts,
        resetAll
      }}
    >
      {children}
    </StreetlightContext.Provider>
  );
};

export const useStreetlight = () => {
  const context = useContext(StreetlightContext);
  if (!context) {
    throw new Error('useStreetlight must be used within a StreetlightProvider');
  }
  return context;
};
