/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { Radio, Copy, Check, X, Terminal, Code2 } from 'lucide-react';

interface MqttPacketModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MqttPacketModal: React.FC<MqttPacketModalProps> = ({ isOpen, onClose }) => {
  const { metadata, light, airQuality, microGrid } = useStreetlight();
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const topicName = `telemetry/v1/nodes/${metadata.nodeId}/sensors`;

  const packetJson = {
    header: {
      node_id: metadata.nodeId,
      timestamp: new Date().toISOString(),
      firmware: metadata.firmware,
      uptime_sec: metadata.uptimeSeconds,
      rssi_dbm: metadata.signalRssi
    },
    lighting: {
      duty_cycle_pct: light.intensity,
      mode: light.mode,
      current_wattage: light.currentWattage,
      motion_detected: light.motionDetected,
      radar_doppler_triggered: light.radarTriggered,
      pir_thermal_triggered: light.pirTriggered,
      ambient_lux: light.ambientLux,
      accumulated_energy_saved_wh: +light.accumulatedEnergySavedWh.toFixed(2)
    },
    air_quality: {
      pm2_5_ug_m3: airQuality.pm25,
      pm10_ug_m3: airQuality.pm10,
      co2_ppm: airQuality.co2,
      voc_ppb: airQuality.voc,
      no2_ppb: airQuality.no2,
      co_ppm: airQuality.co,
      epa_aqi: airQuality.aqi,
      aqi_category: airQuality.aqiCategory,
      ambient: {
        temp_c: airQuality.temperatureC,
        humidity_rh: airQuality.humidityPct,
        pressure_hpa: airQuality.pressureHpa
      }
    },
    microgrid: {
      solar_pv_watts: microGrid.solarPower,
      solar_pv_volts: microGrid.solarVoltage,
      battery_soc_pct: microGrid.batterySoC,
      battery_terminal_volts: microGrid.batteryVoltage,
      charging_state: microGrid.chargingState,
      grid_fallback_engaged: microGrid.gridFallbackActive,
      daily_solar_yield_wh: microGrid.dailySolarYieldWh
    }
  };

  const jsonString = JSON.stringify(packetJson, null, 2);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">
                Live Edge MQTT Telemetry Payload
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Topic: <span className="text-cyan-400">{topicName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-copy-mqtt-json"
              type="button"
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto font-mono text-xs text-cyan-300 bg-slate-950/80 leading-relaxed">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900 text-xs text-slate-400 flex items-center justify-between">
          <span>QoS: 1 (At least once delivery)</span>
          <span>Compression: None / Raw JSON</span>
        </div>

      </div>
    </div>
  );
};
