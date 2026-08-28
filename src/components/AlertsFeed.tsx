/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useStreetlight } from '../context/StreetlightContext';
import { 
  Bell, 
  AlertTriangle, 
  Info, 
  ShieldAlert, 
  Trash2, 
  CheckCircle, 
  Lightbulb, 
  Wind, 
  Zap, 
  X 
} from 'lucide-react';
import { NodeAlert } from '../types';

export const AlertsFeed: React.FC = () => {
  const { alerts, dismissAlert, clearAlerts } = useStreetlight();

  const getAlertIcon = (category: NodeAlert['category'], level: NodeAlert['level']) => {
    if (level === 'critical') return <ShieldAlert className="w-4 h-4 text-rose-400" />;
    if (level === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (category === 'lighting') return <Lightbulb className="w-4 h-4 text-amber-400" />;
    if (category === 'air_quality') return <Wind className="w-4 h-4 text-cyan-400" />;
    if (category === 'microgrid') return <Zap className="w-4 h-4 text-emerald-400" />;
    return <Info className="w-4 h-4 text-blue-400" />;
  };

  return (
    <div id="alerts-feed-card" className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-md flex flex-col h-full">
      
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            System Event & Edge Logs
          </h2>
          {alerts.length > 0 && (
            <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
              {alerts.length}
            </span>
          )}
        </div>

        {alerts.length > 0 && (
          <button
            id="btn-clear-alerts"
            type="button"
            onClick={clearAlerts}
            className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            <span>Clear</span>
          </button>
        )}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto max-h-64 space-y-2.5 pr-1">
        {alerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
            <CheckCircle className="w-6 h-6 text-slate-600" />
            <span>All systems nominal. No active edge warnings.</span>
          </div>
        ) : (
          alerts.map(alert => (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border text-xs flex items-start justify-between gap-2.5 transition-all ${
                alert.level === 'critical'
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                  : alert.level === 'warning'
                  ? 'bg-amber-950/40 border-amber-800/60 text-amber-200'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5 shrink-0">
                  {getAlertIcon(alert.category, alert.level)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <strong className="font-semibold text-slate-100">{alert.title}</strong>
                    <span className="text-[10px] text-slate-400 font-mono">{alert.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                    {alert.description}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => dismissAlert(alert.id)}
                className="text-slate-500 hover:text-slate-300 p-0.5 rounded transition-colors"
                title="Dismiss log"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>

    </div>
  );
};
