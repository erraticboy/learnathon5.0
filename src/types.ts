/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type LightingMode = 'auto' | 'manual' | 'eco' | 'emergency';

export interface AirQualityData {
  pm25: number;       // µg/m³ (Particulate Matter <2.5µm)
  pm10: number;       // µg/m³ (Particulate Matter <10µm)
  co2: number;        // ppm (Carbon Dioxide)
  voc: number;        // ppb or Index (Volatile Organic Compounds)
  no2: number;        // ppb (Nitrogen Dioxide)
  co: number;         // ppm (Carbon Monoxide)
  aqi: number;        // Calculated Air Quality Index (0-500)
  aqiCategory: 'Good' | 'Moderate' | 'Unhealthy for Sensitive' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  aqiColor: string;
  temperatureC: number;
  humidityPct: number;
  pressureHpa: number;
  lastUpdated: string;
}

export interface LightState {
  intensity: number;          // 0 - 100%
  targetIntensity: number;    // Target requested intensity
  mode: LightingMode;
  motionDetected: boolean;
  presenceDurationSec: number;
  prolongedPresenceActive: boolean;
  radarTriggered: boolean;    // 24GHz Doppler radar (fast vehicles)
  pirTriggered: boolean;      // PIR sensor (pedestrians)
  animalDetected: boolean;    // Animal (cat/dog) in sensor cone
  animalFiltered: boolean;    // Animal rejected by Pet Immunity algorithm (prevents power waste)
  petImmunityEnabled: boolean;// Toggle for AI/Threshold Animal Filtering
  petRejectionsCount: number; // Count of avoided false triggers
  fogDensity: number;         // 0 - 100% fog concentration
  isWinterMode: boolean;      // Winter climate mode
  fogPenetrationActive: boolean; // High-lumens optical fog penetration mode
  ambientLux: number;         // Ambient brightness
  isNightTime: boolean;
  idleIntensity: number;      // e.g. 20%
  activeIntensity: number;    // e.g. 100%
  holdTimeoutSec: number;     // e.g. 15s
  holdRemainingSec: number;
  currentWattage: number;     // e.g., 0-60W
  conventionalWattage: number;// Fixed 60W baseline
  accumulatedEnergySavedWh: number;
}

export interface InteractiveEntity {
  type: 'vehicle' | 'pedestrian' | 'animal';
  position: number; // 0 to 100% along road (where 50% is directly below streetlight)
  visible: boolean;
}

export type ChargingState = 'bulk' | 'absorption' | 'float' | 'discharging' | 'idle';

export interface MicroGridState {
  solarVoltage: number;       // V (e.g. 18.4V)
  solarCurrent: number;       // A (e.g. 2.1A)
  solarPower: number;         // W (Voltage * Current)
  batterySoC: number;         // % (State of Charge 0-100)
  batteryVoltage: number;     // V (e.g. 12.8V - 14.4V)
  batteryCurrent: number;     // A (positive = charging, negative = discharging)
  batteryTempC: number;
  chargingState: ChargingState;
  gridFallbackActive: boolean;
  dailySolarYieldWh: number;
  dailyGridConsumptionWh: number;
}

export interface PoleNode {
  id: string;
  name: string;
  positionPct: number; // 0 to 100% position on road
  intensity: number;   // 0 to 100%
  wattage: number;     // e.g. 15W idle, 60W active
  motionDetected: boolean;
  radarTriggered: boolean;
  pirTriggered: boolean;
  animalDetected: boolean;
  animalFiltered: boolean;
  fogPenetrationActive: boolean;
  batterySoC: number;
  solarPower: number;
  ambientLux: number;
  holdRemainingSec: number;
}

export interface TelemetryRecord {
  id: string;
  timestamp: string;
  timeLabel: string;
  lightIntensity: number;
  wattage: number;
  pm25: number;
  pm10: number;
  co2: number;
  voc: number;
  aqi: number;
  batterySoC: number;
  solarPower: number;
  batteryCurrent: number;
  batteryTempC: number;
  motionEvent: boolean;
  petRejectionEvents: number;
  fogDensity: number;
  radarSpeedKmh: number;
  radarDistanceM: number;
  poleIntensities: number[]; // Intensities of Pole 1 through 8
}

export interface NodeAlert {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'critical';
  category: 'air_quality' | 'microgrid' | 'lighting' | 'sensor';
  title: string;
  description: string;
}

export interface NodeMetadata {
  nodeId: string;
  nodeName: string;
  location: string;
  coordinates: { lat: number; lng: number };
  firmware: string;
  connectivity: 'LoRaWAN' | 'NB-IoT' | 'Wi-Fi' | '4G/LTE';
  signalRssi: number; // dBm e.g. -68 dBm
  uptimeSeconds: number;
}
