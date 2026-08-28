/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StreetlightProvider } from './context/StreetlightContext';
import { Header } from './components/Header';
import { PoleVisualizer } from './components/PoleVisualizer';
import { LightingControlCard } from './components/LightingControlCard';
import { AirQualityCard } from './components/AirQualityCard';
import { MicroGridCard } from './components/MicroGridCard';
import { TelemetryAnalytics } from './components/TelemetryAnalytics';
import { AlertsFeed } from './components/AlertsFeed';
import { ArchitectureInfoModal } from './components/ArchitectureInfoModal';
import { MqttPacketModal } from './components/MqttPacketModal';

function DashboardContent() {
  const [showArchitectureModal, setShowArchitectureModal] = useState(false);
  const [showMqttModal, setShowMqttModal] = useState(false);

  return (
    <div className="dashboard-shell min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Application Bar */}
      <Header
        onOpenArchitecture={() => setShowArchitectureModal(true)}
        onOpenRawPacket={() => setShowMqttModal(true)}
      />

      {/* Main Responsive Grid Layout */}
      <main className="dashboard-main flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Top Hero Section: Interactive Physical Pole Simulation & Live Logs Feed */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PoleVisualizer />
          </div>
          <div className="lg:col-span-1">
            <AlertsFeed />
          </div>
        </section>

        {/* Primary Subsystem Cards: Lighting Control (0-100%), Air Quality (PM2.5, CO2, VOCs), & Solar Microgrid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="flex flex-col">
            <LightingControlCard />
          </div>
          <div className="flex flex-col">
            <AirQualityCard />
          </div>
          <div className="flex flex-col">
            <MicroGridCard />
          </div>
        </section>

        {/* Real-time Time Series Telemetry Analytics Chart */}
        <section>
          <TelemetryAnalytics />
        </section>

      </main>

      {/* Modals for Deep Learning & Testing */}
      <ArchitectureInfoModal
        isOpen={showArchitectureModal}
        onClose={() => setShowArchitectureModal(false)}
      />

      <MqttPacketModal
        isOpen={showMqttModal}
        onClose={() => setShowMqttModal(false)}
      />

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-400">
        <p>
          Micro-Grid Smart Streetlight & Air Quality Monitoring Node • Urban Edge IoT Architecture
        </p>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <StreetlightProvider>
      <DashboardContent />
    </StreetlightProvider>
  );
}

