/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AirQualityData } from '../types';

/**
 * Calculates standard US EPA AQI category & value based on PM2.5 concentration (µg/m³)
 */
export function calculatePM25AQI(pm25: number): { aqi: number; category: AirQualityData['aqiCategory']; color: string } {
  const c = Math.max(0, pm25);
  let aqi = 0;

  // EPA PM2.5 standard breakpoints
  if (c <= 12.0) {
    aqi = ((50 - 0) / (12.0 - 0.0)) * (c - 0.0) + 0;
  } else if (c <= 35.4) {
    aqi = ((100 - 51) / (35.4 - 12.1)) * (c - 12.1) + 51;
  } else if (c <= 55.4) {
    aqi = ((150 - 101) / (55.4 - 35.5)) * (c - 35.5) + 101;
  } else if (c <= 150.4) {
    aqi = ((200 - 151) / (150.4 - 55.5)) * (c - 55.5) + 151;
  } else if (c <= 250.4) {
    aqi = ((300 - 201) / (250.4 - 150.5)) * (c - 150.5) + 201;
  } else {
    aqi = ((500 - 301) / (500.4 - 250.5)) * (c - 250.5) + 301;
  }

  const roundedAqi = Math.min(500, Math.round(aqi));

  if (roundedAqi <= 50) {
    return { aqi: roundedAqi, category: 'Good', color: '#10b981' };
  } else if (roundedAqi <= 100) {
    return { aqi: roundedAqi, category: 'Moderate', color: '#eab308' };
  } else if (roundedAqi <= 150) {
    return { aqi: roundedAqi, category: 'Unhealthy for Sensitive', color: '#f97316' };
  } else if (roundedAqi <= 200) {
    return { aqi: roundedAqi, category: 'Unhealthy', color: '#ef4444' };
  } else if (roundedAqi <= 300) {
    return { aqi: roundedAqi, category: 'Very Unhealthy', color: '#a855f7' };
  } else {
    return { aqi: roundedAqi, category: 'Hazardous', color: '#881337' };
  }
}

export function getCO2Status(co2: number): { label: string; color: string; description: string } {
  if (co2 < 450) {
    return { label: 'Optimal Ambient', color: '#10b981', description: 'Fresh outdoor background level' };
  } else if (co2 < 800) {
    return { label: 'Normal Urban', color: '#10b981', description: 'Standard city roadside levels' };
  } else if (co2 < 1200) {
    return { label: 'Elevated Traffic', color: '#eab308', description: 'Moderate localized combustion emissions' };
  } else if (co2 < 2000) {
    return { label: 'High Congestion', color: '#f97316', description: 'Heavy vehicle idling or stagnant airflow' };
  } else {
    return { label: 'Critical Pollution', color: '#ef4444', description: 'Severe local combustion plume' };
  }
}

export function getVOCStatus(voc: number): { label: string; color: string; description: string } {
  if (voc < 100) {
    return { label: 'Clean Air', color: '#10b981', description: 'Extremely low hydrocarbon vapor' };
  } else if (voc < 250) {
    return { label: 'Acceptable', color: '#10b981', description: 'Minor background solvents & exhaust' };
  } else if (voc < 500) {
    return { label: 'Moderate', color: '#eab308', description: 'Detectible unburnt fuel / chemical volatiles' };
  } else if (voc < 1000) {
    return { label: 'Unhealthy', color: '#f97316', description: 'Elevated VOCs from exhaust or industrial activity' };
  } else {
    return { label: 'Toxic Warning', color: '#ef4444', description: 'Severe volatile organic solvent exposure' };
  }
}

export function formatWattage(watts: number): string {
  return `${watts.toFixed(1)} W`;
}

export function formatEnergy(wh: number): string {
  if (wh >= 1000) {
    return `${(wh / 1000).toFixed(2)} kWh`;
  }
  return `${Math.round(wh)} Wh`;
}
