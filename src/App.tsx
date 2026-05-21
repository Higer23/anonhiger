/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import GlassForm from './components/GlassForm';
import ClientInfoIndicator from './components/ClientInfoIndicator';
import HistoryPanel from './components/HistoryPanel';
import HowToDeploy from './components/HowToDeploy';
import { MessageEntry, ClientInfo } from './types';
import confetti from 'canvas-confetti';
import { ShieldCheck, Sparkles, CheckCircle2, MailCheck, Info, Share2, Award } from 'lucide-react';

export default function App() {
  const [history, setHistory] = useState<MessageEntry[]>([]);
  const [clientInfo, setClientInfo] = useState<ClientInfo | null>(null);
  const [isLoadingClientInfo, setIsLoadingClientInfo] = useState(false);
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);
  const [utcTime, setUtcTime] = useState<string>('');

  // Hydrate local logs on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('np_history');
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Error loading past history logs:', err);
    }

    // Dynamic UTC ticker
    const timer = setInterval(() => {
      const now = new Date();
      setUtcTime(now.toUTCString());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSuccessSend = (entry: MessageEntry) => {
    const updated = [entry, ...history];
    setHistory(updated);
    localStorage.setItem('np_history', JSON.stringify(updated));
    
    // Open success overlay dialog
    setShowSuccessOverlay(true);

    // Blast celebratory confetti in Gold and Off-White colors
    try {
      const end = Date.now() + 2500;
      const colors = ['#c9a84c', '#ffffff', '#e8e2d5', '#a18131'];

      (function frame() {
        confetti({
          particleCount: 5,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors
        });
        confetti({
          particleCount: 5,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      })();
    } catch (err) {
      console.warn('Canvas confetti execution bypassed:', err);
    }
  };

  const handleDeleteOne = (id: string) => {
    const updated = history.filter(x => x.id !== id);
    setHistory(updated);
    localStorage.setItem('np_history', JSON.stringify(updated));
  };

  const handleClearAll = () => {
    if (window.confirm('Möchten Sie wirklich Ihren gesamten Nachrichtenverlauf auf diesem Gerät löschen?')) {
      setHistory([]);
      localStorage.removeItem('np_history');
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-gray-100 flex flex-col relative overflow-x-hidden pb-12 selection:bg-gold/30 selection:text-gold selection:font-bold">
      {/* Dynamic ambient noises and light circles */}
      <div className="noise-bg"></div>
      
      {/* Golden atmospheric glow blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold/5 blur-[120px] pointer-events-none z-0 animate-pulse-slow"></div>
      <div className="fixed bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gold/3 blur-[120px] pointer-events-none z-0"></div>

      {/* Floating System Header Bar */}
      <header className="relative z-10 max-w-7xl w-full mx-auto px-4 pt-5 pb-3">
        <div className="glass-glow-card py-2.5 px-4 rounded-xl flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-gray-400 font-mono">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-gold" />
            <span className="font-bold text-gray-300">Freiherr-vom-Stein Gymnasium</span>
            <span className="text-gray-600">|</span>
            <span className="text-[11px] text-gray-500">Nachrichtenportal v2.0</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-400">Offline-PWA Bereit</span>
            </span>
            <span>{utcTime || 'Lade Zeit...'}</span>
          </div>
        </div>
      </header>

      {/* Layout Grid */}
      <main className="relative z-10 max-w-7xl w-full mx-auto px-4 grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4 flex-1">
        
        {/* Left Hand: Glassmorphic Contact form Column */}
        <section className="col-span-1 lg:col-span-7 flex flex-col gap-6">
          <div className="glass-glow-card p-6 md:p-8 rounded-2xl relative overflow-hidden">
            {/* Logo and Greeting */}
            <div className="text-center pb-6 mb-4 border-b border-gold/10">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-gold to-gold-dim flex items-center justify-center mx-auto mb-4 shadowed shadow-gold/20 select-none">
                <span className="font-serif text-2xl font-black text-dark-bg tracking-tight">N</span>
              </div>
              <h1 className="font-serif text-2xl font-extrabold tracking-tight text-gray-100 italic">
                Sicheres Nachrichtenportal
              </h1>
              <p className="text-xs text-gray-400 mt-1.5 max-w-md mx-auto leading-relaxed">
                Übermitteln Sie Ihre Anfrage mit voller Integrität direkt an den Discord-Kanal. Ihre Gerätedaten werden verschlüsselt zur Bot-Prävention verknüpft.
              </p>
            </div>

            <GlassForm 
              onSuccess={handleSuccessSend}
              onSetClientInfo={setFormClient => {
                setClientInfo(setFormClient);
              }}
              onSetLoadingClientInfo={loadingStatus => {
                setIsLoadingClientInfo(loadingStatus);
              }}
            />
          </div>
        </section>

        {/* Right Hand: Info panels, sent messages ledger, github pages deployment center */}
        <section className="col-span-1 lg:col-span-5 flex flex-col gap-6">
          
          {/* Telemetry output viewer */}
          <ClientInfoIndicator 
            info={clientInfo} 
            isLoading={isLoadingClientInfo} 
          />

          {/* Local storage sent messages listing panel */}
          <HistoryPanel 
            history={history}
            onDeleteOne={handleDeleteOne}
            onClearAll={handleClearAll}
          />

          {/* Github Pages Instructions deploy center */}
          <HowToDeploy />
        </section>

      </main>

      {/* Success celebration Overlay modal */}
      {showSuccessOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-bg/95 backdrop-blur-md animate-fade-in">
          <div className="glass-glow-card rounded-2xl max-w-md w-full p-8 text-center border-gold/40 relative overflow-hidden">
            <div className="w-16 h-16 rounded-full bg-gold/10 border border-gold/40 flex items-center justify-center mx-auto mb-5 text-gold">
              <MailCheck className="w-8 h-8" />
            </div>
            
            <h2 className="font-serif text-2xl font-bold text-gold mb-3">
              Nachricht übertragen!
            </h2>
            
            <p className="text-xs text-gray-300 leading-relaxed mb-6 max-w-xs mx-auto">
              Ihre Mitteilung ist erfolgreich gesichert worden und wird unverzüglich übermittelt. Sie wurde ebenfalls lokal in Ihrem Verlauf archiviert.
            </p>

            <button
              onClick={() => setShowSuccessOverlay(false)}
              className="w-full h-11 rounded-lg text-xs font-semibold uppercase tracking-wider bg-gold hover:bg-gold-hover text-dark-bg transition-colors duration-200 cursor-pointer border-0"
              type="button"
            >
              Schließen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
