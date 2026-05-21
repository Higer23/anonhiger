/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClientInfo } from '../types';
import { Cpu, Maximize, Database, Globe, Battery, Compass, Trash2 } from 'lucide-react';

interface Props {
  info: ClientInfo | null;
  isLoading: boolean;
}

export default function ClientInfoIndicator({ info, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="glass-glow-card p-5 rounded-xl font-sans text-sm text-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <div className="w-8 h-8 rounded-full border-2 border-gold/40 border-t-gold animate-spin"></div>
          <span className="text-gray-400 font-mono text-xs">Sammle Gerätetelemetrie für Spam-Verifizierung...</span>
        </div>
      </div>
    );
  }

  if (!info) return null;

  return (
    <div className="glass-glow-card p-5 rounded-xl font-sans text-sm relative overflow-hidden transition-all duration-300">
      <div className="absolute top-0 right-0 p-3 opacity-10">
        <Globe className="w-24 h-24 text-gold" />
      </div>

      <div className="flex items-center gap-2 mb-4">
        <div className="w-2 h-2 rounded-full bg-gold animate-pulse"></div>
        <h3 className="font-serif text-sm font-semibold tracking-wide uppercase text-gold">
          Automatisch verknüpfte Meta-Daten
        </h3>
      </div>
      
      <p className="text-[11px] text-gray-400 mb-4 leading-relaxed font-sans">
        Diese Daten werden automatisch erhoben und als Discord-Embed übertragen, um Phishing- oder Bot-Aktivitäten einzuschränken:
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* IP Line */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">IP-Adresse</span>
            <span className="block text-xs text-gray-200 truncate font-mono">{info.ip}</span>
          </div>
        </div>

        {/* Location */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Compass className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">Standort</span>
            <span className="block text-xs text-gray-200 truncate">
              {info.city !== '–' ? `${info.city}, ${info.country}` : 'Offline / Verborgen'}
            </span>
          </div>
        </div>

        {/* Network connection */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Globe className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">Verbindung</span>
            <span className="block text-xs text-gray-200 truncate font-mono">
              {info.connType} {info.downlink !== '–' ? `(${info.downlink})` : ''}
            </span>
          </div>
        </div>

        {/* CPU cores */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Cpu className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">CPU Kerne</span>
            <span className="block text-xs text-gray-200 truncate font-mono">{info.cores} Kerne</span>
          </div>
        </div>

        {/* Estimated RAM */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Database className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">RAM</span>
            <span className="block text-xs text-gray-200 truncate font-mono">approx. {info.ramGB} GB</span>
          </div>
        </div>

        {/* Battery status */}
        <div className="bg-dark-surface/50 border border-gold/10 p-2.5 rounded-lg flex items-center gap-2.5">
          <Battery className="w-4 h-4 text-gold flex-shrink-0" />
          <div className="min-w-0">
            <span className="block text-[10px] uppercase font-semibold text-gray-500 font-mono">Akkustand</span>
            <span className="block text-xs text-gray-200 truncate">{info.battery}</span>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-gray-400 border-t border-gold/10 pt-3">
        <span>Zustand: <span className="text-emerald-400 font-mono font-bold">Aktiv s-w-r</span></span>
        <span className="font-mono">Browser: {info.browser}</span>
      </div>
    </div>
  );
}
