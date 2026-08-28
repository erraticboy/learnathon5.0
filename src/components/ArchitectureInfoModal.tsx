/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Cpu, 
  X, 
  Layers, 
  Zap, 
  Wind, 
  Lightbulb, 
  Radar, 
  Radio, 
  ShieldCheck, 
  Activity,
  ArrowRight
} from 'lucide-react';

interface ArchitectureInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ArchitectureInfoModal: React.FC<ArchitectureInfoModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'pinouts' | 'firmware_logic'>('architecture');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Hardware Architecture & Edge Firmware Guide
              </h3>
              <p className="text-xs text-slate-400">
                Student reference for ESP32, PMS5003 laser sensor, Doppler radar, MPPT & PWM drivers
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 px-6 bg-slate-950/60 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('architecture')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'architecture'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Block Diagram & Subsystems</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('pinouts')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'pinouts'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Sensor & Microcontroller Pinouts</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('firmware_logic')}
            className={`py-3 px-4 border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'firmware_logic'
                ? 'border-cyan-400 text-cyan-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>State Machine & Formulas</span>
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-xs text-slate-300 leading-relaxed">
          
          {activeTab === 'architecture' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* 1. Solar Microgrid */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                    <Zap className="w-4 h-4" />
                    1. Solar Micro-Grid & Storage
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li><strong>PV Panel</strong>: 100W Monocrystalline module (18V–22V Voc).</li>
                    <li><strong>MPPT Controller</strong>: Synchronous buck converter with 98% tracking efficiency.</li>
                    <li><strong>Battery</strong>: 12.8V 30Ah LiFePO4 pack (approx. 384Wh capacity).</li>
                    <li><strong>Hybrid Relay</strong>: Fallback AC bypass if battery SoC drops below 15%.</li>
                  </ul>
                </div>

                {/* 2. Adaptive Dimming */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-amber-400 flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4" />
                    2. Intelligent Adaptive Dimming
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li><strong>Luminaire</strong>: 60W High-Efficiency Bridgelux COB LED (140 lm/W).</li>
                    <li><strong>Driver</strong>: MeanWell HLG or custom constant-current buck with 0-10V / PWM control.</li>
                    <li><strong>Motion Sensing</strong>: Dual-tier (PIR thermal for humans + 24GHz RCWL radar for vehicles).</li>
                    <li><strong>Profile</strong>: Dims to 20–25% in idle; ramps to 100% in 300ms upon detection.</li>
                  </ul>
                </div>

                {/* 3. Air Quality Sensor Suite */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
                    <Wind className="w-4 h-4" />
                    3. Environmental Sensing Suite
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li><strong>PM2.5 / PM10</strong>: Plantower PMS5003 laser scattering particle counter (UART).</li>
                    <li><strong>Gases (VOCs, CO₂)</strong>: Sensirion SGP30 / SCD30 optical NDIR sensor (I2C).</li>
                    <li><strong>Atmospheric</strong>: Bosch BME280 for temperature, humidity, and barometric pressure.</li>
                    <li><strong>Aspiration</strong>: Miniature low-RPM intake fan prevents stagnant air readings.</li>
                  </ul>
                </div>

                {/* 4. Connectivity & Cloud */}
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-sm font-bold text-cyan-400 flex items-center gap-2 mb-2">
                    <Radio className="w-4 h-4" />
                    4. Edge Compute & Cloud Telemetry
                  </h4>
                  <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                    <li><strong>MCU</strong>: ESP32-WROOM-32 or STM32 ARM Cortex-M4.</li>
                    <li><strong>Protocol</strong>: MQTT over cellular NB-IoT (SIM7000G) or LoRaWAN.</li>
                    <li><strong>Publish Rate</strong>: Every 10 seconds or immediately upon pollution alert threshold.</li>
                  </ul>
                </div>

              </div>
            </div>
          )}

          {activeTab === 'pinouts' && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-800 text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 font-semibold border-b border-slate-800">
                      <th className="p-2.5">Peripheral Component</th>
                      <th className="p-2.5">Module Part #</th>
                      <th className="p-2.5">Bus / Interface</th>
                      <th className="p-2.5">ESP32 Pinout</th>
                      <th className="p-2.5">Voltage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-400 font-mono">
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">PM2.5 / PM10 Sensor</td>
                      <td className="p-2.5">Plantower PMS5003</td>
                      <td className="p-2.5">UART (9600 baud)</td>
                      <td className="p-2.5 text-cyan-400">RX2 (GPIO 16) / TX2 (GPIO 17)</td>
                      <td className="p-2.5">5V VCC / 3.3V Logic</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">CO₂ & TVOC Sensor</td>
                      <td className="p-2.5">Sensirion SGP30</td>
                      <td className="p-2.5">I2C (0x58)</td>
                      <td className="p-2.5 text-cyan-400">SDA (GPIO 21) / SCL (GPIO 22)</td>
                      <td className="p-2.5">3.3V</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">Temp / Humidity / Baro</td>
                      <td className="p-2.5">Bosch BME280</td>
                      <td className="p-2.5">I2C (0x76)</td>
                      <td className="p-2.5 text-cyan-400">SDA (GPIO 21) / SCL (GPIO 22)</td>
                      <td className="p-2.5">3.3V</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">24GHz Doppler Radar</td>
                      <td className="p-2.5">RCWL-0516 / HLK-LD2410</td>
                      <td className="p-2.5">Digital GPIO / UART</td>
                      <td className="p-2.5 text-amber-400">GPIO 34 (Interrupt In)</td>
                      <td className="p-2.5">3.3V - 5V</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">PIR Motion Detector</td>
                      <td className="p-2.5">HC-SR501 / AM312</td>
                      <td className="p-2.5">Digital GPIO</td>
                      <td className="p-2.5 text-amber-400">GPIO 35 (Interrupt In)</td>
                      <td className="p-2.5">3.3V</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">LED Dimming Control</td>
                      <td className="p-2.5">MeanWell PWM / Opto</td>
                      <td className="p-2.5">Hardware PWM (1kHz)</td>
                      <td className="p-2.5 text-amber-400">GPIO 18 (LEDC Channel 0)</td>
                      <td className="p-2.5">3.3V Opto-isolated</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-slate-200">Battery Voltage Sense</td>
                      <td className="p-2.5">Resistor Divider 4:1</td>
                      <td className="p-2.5">ADC1</td>
                      <td className="p-2.5 text-emerald-400">GPIO 36 (ADC1_CH0)</td>
                      <td className="p-2.5">0-3.3V</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'firmware_logic' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <h4 className="text-sm font-bold text-white">
                  Edge State Machine Implementation
                </h4>
                <div className="font-mono text-xs text-slate-300 bg-slate-900 p-3 rounded-lg border border-slate-800 overflow-x-auto">
                  {`// Simplified Edge State Controller in C++ / Arduino
void loop() {
  readEnvironmentalSensors(); // Sample PMS5003 + SGP30
  
  bool isDusk = (analogRead(LDR_PIN) < DUSK_LUX_THRESHOLD);
  bool motion = digitalRead(PIR_PIN) || digitalRead(RADAR_PIN);
  
  if (!isDusk) {
    targetPWM = 0; // Daytime: Lights OFF, Solar MPPT charging active
  } else {
    if (motion) {
      lastMotionTimestamp = millis();
      targetPWM = 255; // 100% Brightness during vehicle/pedestrian transit
    } else if (millis() - lastMotionTimestamp < HOLD_TIME_MS) {
      targetPWM = 255; // Sustain peak brightness during hold window
    } else {
      targetPWM = 64;  // 25% Idle baseline power saving
    }
  }

  smoothRampPWM(targetPWM); // 300ms smooth optical transition
  publishMqttTelemetry();   // Stream JSON payload to Cloud Broker
}`}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <h4 className="text-sm font-bold text-white">
                  Energy Conservation Formula
                </h4>
                <p className="text-slate-400">
                  Daily energy consumed by the smart pole compared to a traditional fixed streetlight:
                </p>
                <div className="p-3 bg-slate-900 rounded-lg font-mono text-cyan-300 text-xs">
                  {`E_smart = (P_idle * t_idle) + (P_peak * t_active) + (P_sensors * 24h)
E_smart = (15W * 10.5h) + (60W * 1.5h) + (2W * 24h) = 295.5 Wh/day

E_traditional = 60W * 12h = 720 Wh/day

Net Energy Reduction = (720 - 295.5) / 720 = ~59.0% Saved!`}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400 flex items-center justify-between">
          <span>Smart Infrastructure Engineering Project Reference</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
};
