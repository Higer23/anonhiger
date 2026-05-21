/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MessageEntry } from '../types';
import { Mail, Trash2, Calendar, User, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface Props {
  history: MessageEntry[];
  onDeleteOne: (id: string) => void;
  onClearAll: () => void;
}

export default function HistoryPanel({ history, onDeleteOne, onClearAll }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  const toggleExpandMessage = (id: string) => {
    if (expandedIds.includes(id)) {
      setExpandedIds(expandedIds.filter(x => x !== id));
    } else {
      setExpandedIds([...expandedIds, id]);
    }
  };

  return (
    <div className="glass-glow-card rounded-xl overflow-hidden transition-all duration-300">
      {/* Accordion header */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 text-left transition-colors duration-200 hover:bg-dark-surface/50 select-none cursor-pointer"
        type="button"
      >
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-gold" />
          <span className="font-serif font-semibold text-sm tracking-wide text-gray-100">
            Gesendete Nachrichten
          </span>
          <span className="bg-gold text-dark-bg text-xs font-bold px-2.5 py-0.5 rounded-full inline-flex items-center justify-center">
            {history.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400" />
        )}
      </button>

      {/* Accordion List Body */}
      {isOpen && (
        <div className="border-t border-gold/10 p-4 bg-dark-surface/30">
          {history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 flex flex-col items-center gap-2">
              <Mail className="w-8 h-8 text-gray-600 animate-bounce" />
              <p className="text-xs">Noch keine gesendeten Nachrichten aufgezeichnet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">Nachrichten-Protokoll</span>
                <button
                  onClick={onClearAll}
                  className="text-xs text-rose-400 hover:text-rose-300 transition-colors flex items-center gap-1.5 cursor-pointer font-sans bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1 rounded-md"
                  type="button"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Alle löschen
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-gold/20">
                {history.map((entry) => {
                  const isExpanded = expandedIds.includes(entry.id);
                  return (
                    <div 
                      key={entry.id} 
                      className="bg-dark-surface/60 border border-gold/5 hover:border-gold/25 p-3.5 rounded-lg relative transition-all duration-200 group"
                    >
                      {/* Delete single button */}
                      <button
                        onClick={() => onDeleteOne(entry.id)}
                        className="absolute top-2.5 right-2.5 text-gray-500 hover:text-rose-400 p-1.5 rounded bg-transparent hover:bg-rose-500/10 cursor-pointer lg:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        title="Eintrag löschen"
                        type="button"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Heading */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-1 mb-2 pr-6">
                        <span className="text-xs font-semibold text-gold font-serif truncate">
                          {entry.subject}
                        </span>
                        <span className="text-[10px] font-mono text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {entry.date}
                        </span>
                      </div>

                      {/* Sender metadata */}
                      <div className="text-[11px] text-gray-400 flex items-center gap-1 mb-2">
                        <User className="w-3 h-3 text-gold/60" />
                        <span>Absender: </span>
                        <span className="text-gray-200">{entry.name}</span>
                      </div>

                      {/* Body */}
                      <p 
                        onClick={() => toggleExpandMessage(entry.id)}
                        className={`text-xs text-gray-300 leading-relaxed break-words cursor-pointer transition-all ${
                          isExpanded ? '' : 'line-clamp-2 text-gray-400 hover:text-gray-200'
                        }`}
                        title="Klicken zum Erweitern/Einklappen"
                      >
                        {entry.message}
                      </p>

                      <div className="mt-1 flex justify-end">
                        <span className="text-[9px] text-gold/40 font-mono">
                          {isExpanded ? 'Klicken zum Einklappen ↑' : 'Klicken zum Maximieren ↓'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
