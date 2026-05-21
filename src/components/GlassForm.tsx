/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { FormValues, FormErrors, ClientInfo, MessageEntry } from '../types';
import { Sparkles, Send, RefreshCw, AlertTriangle, CheckCircle, Flame, Smile, ShieldAlert } from 'lucide-react';

interface Props {
  onSuccess: (entry: MessageEntry) => void;
  onSetClientInfo: (info: ClientInfo | null) => void;
  onSetLoadingClientInfo: (isLoading: boolean) => void;
}

const TEMPLATES = {
  frage: { subject: 'Frage', body: 'Hallo,\n\nIch hätte eine Frage bezüglich:\n\n' },
  vorschlag: { subject: 'Vorschlag', body: 'Hallo,\n\nIch möchte folgenden Vorschlag machen:\n\n' },
  hallo: { subject: 'Hallo 👋', body: 'Hey, ich wollte mich kurz melden und Hallo sagen!\n\n' },
  fehler: { subject: 'Fehler melden', body: 'Hallo,\n\nIch habe folgenden Fehler gefunden:\n\nBeschreibung:\n\nSchritte zum Reproduzieren:\n' },
};

const QUICK_EMOJIS = ['😊', '💡', '❓', '⚡', '🎉', '🔥', '👋', '🙏'];

const WEBHOOK_URL = "https://discord.com/api/webhooks/1487118534667407562/fHSRC5NlbcAZi3J5nuxWNbCxZvXJwLMpL2PiU0m3Ip9rI7-8visjmfrKxl0m7W5F9Gul";
const COOLDOWN_MS = 60_000;
const MAX_PER_HOUR = 3;

export default function GlassForm({ onSuccess, onSetClientInfo, onSetLoadingClientInfo }: Props) {
  const [formValues, setFormValues] = useState<FormValues>({
    name: '',
    subject: '',
    message: '',
    captchaAnswer: '',
  });

  const [formErrors, setFormErrors] = useState<FormErrors>({
    name: undefined,
    subject: undefined,
    message: undefined,
    captcha: undefined,
  });

  // Honeypot anti-spam field
  const [honeypot, setHoneypot] = useState('');

  // Math Captcha
  const [mathNumA, setMathNumA] = useState(0);
  const [mathNumB, setMathNumB] = useState(0);
  const [correctSum, setCorrectSum] = useState(0);

  // Active Template identifier
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);

  // Status flags
  const [isSending, setIsSending] = useState(false);
  const [rateLimitMessage, setRateLimitMessage] = useState<string | null>(null);
  
  // Custom Error Recovery State
  const [webhookError, setWebhookError] = useState<{
    occurred: boolean;
    reason: string;
    payloadToRetry: any | null;
  }>({
    occurred: false,
    reason: '',
    payloadToRetry: null
  });

  const messageRef = useRef<HTMLTextAreaElement>(null);

  // Generate math captcha on start or reload
  const generateCaptcha = () => {
    const a = Math.floor(Math.random() * 15) + 1;
    const b = Math.floor(Math.random() * 15) + 1;
    setMathNumA(a);
    setMathNumB(b);
    setCorrectSum(a + b);
    setFormValues(v => ({ ...v, captchaAnswer: '' }));
    setFormErrors(e => ({ ...e, captcha: undefined }));
  };

  useEffect(() => {
    generateCaptcha();
  }, []);

  // Real-time character count check
  const charLength = formValues.message.length;

  // Rate Limiter Checks
  const getRateLimitData = () => {
    try {
      return JSON.parse(localStorage.getItem('np_cooldown_data') || '{}');
    } catch {
      return {};
    }
  };

  const getCooldownStatus = (): string | null => {
    const now = Date.now();
    const data = getRateLimitData();
    const timestamps: number[] = (data.ts || []).filter((t: number) => now - t < 3_600_000);

    // 1. Strict Cooldown Timer
    if (data.last && now - data.last < COOLDOWN_MS) {
      const remainingSecs = Math.ceil((COOLDOWN_MS - (now - data.last)) / 1000);
      return `Bitte warte noch ${remainingSecs} Sekunden vor der nächsten Nachricht.`;
    }

    // 2. Strict hourly throttle
    if (timestamps.length >= MAX_PER_HOUR) {
      return `Du hast das stündliche Limit erreicht (max. ${MAX_PER_HOUR} Nachrichten erlaubt). Bitte warte unbenutzt ab.`;
    }

    return null;
  };

  const recordSuccessfulSend = () => {
    const now = Date.now();
    const data = getRateLimitData();
    const timestamps: number[] = (data.ts || []).filter((t: number) => now - t < 3_600_000);
    timestamps.push(now);

    localStorage.setItem('np_cooldown_data', JSON.stringify({
      last: now,
      ts: timestamps
    }));
  };

  // Populate client telemetry data
  const collectClientInfo = async (): Promise<ClientInfo> => {
    let checkIp = 'Offline / Verdeckt';
    try {
      const res = await fetch('https://api.ipify.org?format=json', { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const body = await res.json();
        checkIp = body.ip || checkIp;
      }
    } catch {}

    let city = '–', country = '–', region = '–', isp = '–';
    try {
      if (checkIp !== 'Offline / Verdeckt') {
        const geoRes = await fetch(`https://ip-api.com/json/${checkIp}?fields=status,country,regionName,city,isp,org`, { signal: AbortSignal.timeout(4000) });
        if (geoRes.ok) {
          const geo = await geoRes.json();
          if (geo.status === 'success') {
            city = geo.city || '–';
            country = geo.country || '–';
            region = geo.regionName || '–';
            isp = geo.isp || geo.org || '–';
          }
        }
      }
    } catch {}

    let battery = '–';
    try {
      const nav: any = navigator;
      if ('getBattery' in nav) {
        const b = await nav.getBattery();
        const pct = Math.round(b.level * 100);
        battery = `${pct}% ${b.charging ? '🔋 (lädt)' : '🔋 (entlädt)'}`;
      }
    } catch {}

    const navConn: any = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    const connType = navConn ? (navConn.effectiveType || navConn.type || 'Standard') : 'Standard';
    const downlink = navConn?.downlink ? `${navConn.downlink} Mbit/s` : '–';
    const rtt = navConn?.rtt ? `${navConn.rtt} ms` : '–';

    const ua = navigator.userAgent;
    let browser = 'Unbekannter Browser';
    if (/Edg\//i.test(ua)) browser = 'Microsoft Edge';
    else if (/OPR\//i.test(ua)) browser = 'Opera';
    else if (/Chrome\//i.test(ua)) browser = 'Google Chrome';
    else if (/Firefox\//i.test(ua)) browser = 'Mozilla Firefox';
    else if (/Safari\//i.test(ua)) browser = 'Apple Safari';

    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Europe/Berlin';
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    return {
      ip: checkIp,
      city,
      country,
      region,
      isp,
      battery,
      connType,
      rtt,
      downlink,
      cores: navigator.hardwareConcurrency || 'Unbekannt',
      ramGB: (navigator as any).deviceMemory || 'Unbekannt',
      browser,
      ua,
      screenRes: `${window.screen.width}×${window.screen.height}`,
      darkMode: isDark ? 'Standard Dunkel 🌙' : 'Standard Hell ☀️',
      languages: (navigator.languages || [navigator.language]).join(', '),
      tz,
      time: new Date().toLocaleString('de-DE', { timeZone: tz }),
      platform: (navigator as any).platform || 'Unbekannt',
    };
  };

  // Perform quick templates selection
  const selectTemplate = (key: keyof typeof TEMPLATES) => {
    const tpl = TEMPLATES[key];
    setFormValues(prev => ({
      ...prev,
      subject: tpl.subject,
      message: tpl.body,
    }));
    setActiveTemplate(key);
    
    // Clear validation errors for these fields on selection
    setFormErrors(prev => ({ ...prev, subject: undefined, message: undefined }));

    if (messageRef.current) {
      messageRef.current.focus();
      // Caret position set to end of text
      setTimeout(() => {
        if (messageRef.current) {
          messageRef.current.selectionStart = messageRef.current.selectionEnd = tpl.body.length;
        }
      }, 50);
    }
  };

  // Back caret position insertion for emojis
  const insertEmoji = (emoji: string) => {
    const ta = messageRef.current;
    if (!ta) return;

    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const text = formValues.message;

    const newText = text.slice(0, start) + emoji + text.slice(end);
    setFormValues(prev => ({ ...prev, message: newText }));
    setFormErrors(prev => ({ ...prev, message: undefined }));

    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + emoji.length;
    }, 50);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  // Secure client-side regex and rules validations
  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    // 1. Strict Name Regex validation
    // Alphanumeric with typical German umlauts, letters, spaces. Minimum length 3, maximum 80
    const nameRegex = /^[a-zA-ZäöüÄÖÜßáéíóúÁÉÍÓÚ\s.\-']{3,80}$/;
    if (!formValues.name.trim()) {
      errors.name = 'Der Name ist erforderlich und kann nicht leer sein.';
      isValid = false;
    } else if (!nameRegex.test(formValues.name.trim())) {
      errors.name = 'Bitte tragen Sie einen gültigen Namen ein (3-80 Zeichen, keine Sonderzeichen).';
      isValid = false;
    }

    // 2. Subject validation
    if (!formValues.subject.trim()) {
      errors.subject = 'Der Betreff darf nicht leer sein.';
      isValid = false;
    } else if (formValues.subject.trim().length > 120) {
      errors.subject = 'Der Betreff darf maximal 120 Zeichen lang sein.';
      isValid = false;
    }

    // 3. Message validation (length check 10 to 1500)
    if (formValues.message.trim().length < 10) {
      errors.message = 'Die Nachricht muss mindestens 10 Zeichen beinhalten.';
      isValid = false;
    } else if (formValues.message.length > 1500) {
      errors.message = 'Die Nachricht darf maximal 1500 Zeichen betragen.';
      isValid = false;
    }

    // 4. Captcha validation
    if (!formValues.captchaAnswer) {
      errors.captcha = 'Bitte rechnen Sie das Rechenrätsel aus.';
      isValid = false;
    } else if (parseInt(formValues.captchaAnswer) !== correctSum) {
      errors.captcha = 'Das Rechenergebnis ist inkorrekt.';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  // Core discord embeds structure builder
  const buildDiscordEmbed = (values: FormValues, info: ClientInfo) => {
    return {
      embeds: [
        {
          title: `📨 Neue Nachricht — ${values.subject}`,
          color: 0xC9A84C,
          fields: [
            { name: '👤 Absender', value: values.name.trim(), inline: true },
            { name: '🕐 Uhrzeit', value: info.time, inline: true },
            { name: '\u200b', value: '\u200b', inline: false },
            { name: '💬 Nachricht', value: values.message.trim(), inline: false },
            { name: '🌐 IP-Adresse', value: info.ip, inline: true },
            { name: '🏙️ Standort', value: `${info.city}, ${info.region}`, inline: true },
            { name: '🌍 Land', value: info.country, inline: true },
            { name: '📡 ISP Netzanbieter', value: info.isp, inline: true },
            { name: '📶 Verbindungstyp', value: info.connType, inline: true },
            { name: '⏱️ RTT Ping / Downlink', value: `${info.rtt} / ${info.downlink}`, inline: true },
            { name: '🖥️ Auflösung', value: `${info.screenRes} (${info.darkMode})`, inline: true },
            { name: '⚙️ Hardware', value: `CPU: ${info.cores} Kerne / RAM: ~${info.ramGB} GB`, inline: true },
            { name: '🔋 Akku Status', value: info.battery, inline: true },
            { name: '🕰️ Zeitzone', value: info.tz, inline: true },
            { name: '🔍 User-Agent', value: `\`${info.ua.substring(0, 180)}\``, inline: false },
          ],
          footer: { text: 'Nachrichtenportal • Freiherr-vom-Stein Gymnasium' },
          timestamp: new Date().toISOString(),
        }
      ]
    };
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    if (e) e.preventDefault();

    // Spam honeypot detection
    if (honeypot.trim()) {
      console.warn('Spam honeypot activity detected!');
      return;
    }

    // 1. Cooldown & Hourly limit control
    const limitError = getCooldownStatus();
    if (limitError) {
      setRateLimitMessage(limitError);
      return;
    }
    setRateLimitMessage(null);

    // 2. UI Validations
    if (!validateForm()) {
      generateCaptcha();
      return;
    }

    setIsSending(true);
    onSetLoadingClientInfo(true);
    setWebhookError({ occurred: false, reason: '', payloadToRetry: null });

    try {
      // Collect client telemetry
      const clientInfo = await collectClientInfo();
      onSetClientInfo(clientInfo);
      onSetLoadingClientInfo(false);

      const discordPayload = buildDiscordEmbed(formValues, clientInfo);

      // Trigger Webhook API fetch
      const response = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(discordPayload)
      });

      if (!response.ok && response.status !== 204) {
        throw new Error(`Server antwortete mit Fehlerstatus: ${response.status} ${response.statusText}`);
      }

      // Success
      const entry: MessageEntry = {
        id: Math.random().toString(36).substring(2, 9),
        name: formValues.name.trim(),
        subject: formValues.subject.trim(),
        message: formValues.message.trim(),
        date: new Date().toLocaleString('de-DE'),
      };

      recordSuccessfulSend();
      onSuccess(entry);

      // Reset Form fields
      setFormValues({
        name: '',
        subject: '',
        message: '',
        captchaAnswer: '',
      });
      setActiveTemplate(null);
      generateCaptcha();

    } catch (err: any) {
      console.error('Error submitting form to Discord:', err);
      
      // Save data for RETRY payload to never lose typed entries
      setWebhookError({
        occurred: true,
        reason: err.message || 'Die Gegenstelle oder Ihr Netzwerk verweigert den Zugriff.',
        payloadToRetry: formValues
      });
      
      // Keep loading telemetry off
      onSetLoadingClientInfo(false);
    } finally {
      setIsSending(false);
    }
  };

  // Retry logic preserving input states
  const handleRetrySubmit = async () => {
    if (webhookError.payloadToRetry) {
      setFormValues(webhookError.payloadToRetry);
      setWebhookError({ occurred: false, reason: '', payloadToRetry: null });
      // Trigger Submit again
      setTimeout(() => {
        handleSubmit(null as any);
      }, 50);
    }
  };

  return (
    <div className="space-y-6">
      {/* ⚠️ Rate Limit alert panel */}
      {rateLimitMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/25 rounded-xl flex items-start gap-3 animate-pulse">
          <ShieldAlert className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="block text-xs font-semibold text-rose-300">Spam-Sicherheitswarnung</span>
            <span className="block text-xs text-rose-400 mt-1">{rateLimitMessage}</span>
          </div>
        </div>
      )}

      {/* 🛑 Advanced error retry panel (Never loss inputs) */}
      {webhookError.occurred && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl space-y-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs font-semibold text-amber-300">Übertragungsfehler (Webhook Fehlgeschlagen)</span>
              <span className="block text-xs text-gray-400 mt-1 leading-normal">
                Fehler: <code className="bg-dark-bg/40 px-1 py-0.5 rounded font-mono text-[11px] text-amber-200 break-all">{webhookError.reason}</code>
              </span>
              <span className="block text-xs text-amber-400 font-medium mt-2">
                Ihre geschriebene Nachricht ist vollständig gesichert und wurde nicht verworfen!
              </span>
            </div>
          </div>
          <div className="flex justify-end gap-2.5 pt-1">
            <button
              onClick={() => setWebhookError({ occurred: false, reason: '', payloadToRetry: null })}
              className="text-xs text-gray-400 hover:text-white font-sans px-3 py-1.5 rounded-lg border border-gray-700 hover:bg-white/5 cursor-pointer"
              type="button"
            >
              Abbrechen
            </button>
            <button
              onClick={handleRetrySubmit}
              className="text-xs bg-amber-500 hover:bg-amber-400 text-dark-bg font-semibold px-3.5 py-1.5 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition-colors"
              type="button"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Verbindung erneut versuchen
            </button>
          </div>
        </div>
      )}

      {/* Primary Form */}
      <form onSubmit={handleSubmit} className="space-y-4 font-sans" noValidate>
        {/* Spam Trapping Invisible HoneyPot */}
        <div className="absolute left-[-9999px] top-[-9999px]" aria-hidden="true">
          <input
            type="text"
            name="system_verification"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
            tabIndex={-1}
            autoComplete="off"
          />
        </div>

        {/* Schnellvorlagen Selector */}
        <div className="space-y-2">
          <label className="text-[11px] text-gray-500 font-mono tracking-widest uppercase block">
            Schnellvorlage auswählen
          </label>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {Object.keys(TEMPLATES).map((key) => {
              const isSelected = activeTemplate === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => selectTemplate(key as keyof typeof TEMPLATES)}
                  className={`py-2 px-2.5 rounded-lg border text-left text-xs transition-all duration-200 select-none cursor-pointer flex items-center gap-1.5 font-medium ${
                    isSelected
                      ? 'bg-gold/10 border-gold text-gold font-bold shadow-[0_0_12px_rgba(201,168,76,0.1)]'
                      : 'bg-dark-surface/40 border-gold/10 hover:border-gold/30 text-gray-300 hover:bg-dark-surface/80'
                  }`}
                >
                  <Sparkles className="w-3 h-3 text-gold/80" />
                  {key === 'frage' && '❓ Frage'}
                  {key === 'vorschlag' && '💡 Vorschlag'}
                  {key === 'hallo' && '👋 Gruß'}
                  {key === 'fehler' && '🐛 Bugreport'}
                </button>
              );
            })}
          </div>
        </div>

        {/* Sender Name Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-[11px] text-gray-500 font-mono tracking-widest uppercase block">
            Ihr Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={formValues.name}
            onChange={handleInputChange}
            placeholder="z.B. Max Mustermann"
            maxLength={80}
            className={`w-full bg-dark-bg/80 border text-gray-100 rounded-lg py-2.5 px-3.5 text-sm outline-none transition-all duration-200 placeholder-gray-600 focus:border-gold/60 focus:ring-2 focus:ring-gold/10 ${
              formErrors.name ? 'border-rose-500/50 ring-2 ring-rose-500/10' : 'border-gold/10'
            }`}
          />
          {formErrors.name && (
            <p className="text-rose-400 text-xs font-semibold leading-normal flex items-center gap-1 mt-0.5 font-mono">
              ⚠️ {formErrors.name}
            </p>
          )}
        </div>

        {/* Subject Input */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="subject" className="text-[11px] text-gray-500 font-mono tracking-widest uppercase block">
            Betreff
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            value={formValues.subject}
            onChange={handleInputChange}
            placeholder="Worum geht es in Ihrem Anliegen?"
            maxLength={120}
            className={`w-full bg-dark-bg/80 border text-gray-100 rounded-lg py-2.5 px-3.5 text-sm outline-none transition-all duration-200 placeholder-gray-600 focus:border-gold/60 focus:ring-2 focus:ring-gold/10 ${
              formErrors.subject ? 'border-rose-500/50 ring-2 ring-rose-500/10' : 'border-gold/10'
            }`}
          />
          {formErrors.subject && (
            <p className="text-rose-400 text-xs font-semibold leading-normal flex items-center gap-1 mt-0.5 font-mono">
              ⚠️ {formErrors.subject}
            </p>
          )}
        </div>

        {/* Message Input, with inline quick values and count */}
        <div className="flex flex-col gap-1.5 relative">
          <div className="flex justify-between items-center mb-0.5">
            <label htmlFor="message" className="text-[11px] text-gray-500 font-mono tracking-widest uppercase block">
              Nachricht
            </label>
            <span className={`text-[10px] font-mono ${charLength > 1400 ? 'text-rose-400 font-bold' : 'text-gray-500'}`}>
              {charLength} / 1500
            </span>
          </div>

          {/* Emoji pickers toolbar */}
          <div className="flex gap-1.5 pb-2 wrap">
            {QUICK_EMOJIS.map((emoji) => (
              <button
                key={emoji}
                type="button"
                onClick={() => insertEmoji(emoji)}
                className="w-8 h-8 rounded-lg bg-dark-surface border border-gold/10 hover:border-gold/45 text-sm inline-flex items-center justify-center transition-all duration-150 hover:scale-115 cursor-pointer transform hover:-translate-y-1 active:translate-y-0"
                title={`${emoji} einfügen`}
              >
                {emoji}
              </button>
            ))}
          </div>

          <textarea
            id="message"
            name="message"
            ref={messageRef}
            required
            value={formValues.message}
            onChange={handleInputChange}
            placeholder="Geben Sie hier Ihre Nachricht ein (Mindestens 10 Zeichen)..."
            maxLength={1500}
            rows={5}
            className={`w-full bg-dark-bg/80 border text-gray-100 rounded-lg py-2.5 px-3.5 text-sm outline-none transition-all duration-200 placeholder-gray-600 focus:border-gold/60 focus:ring-2 focus:ring-gold/10 leading-relaxed resize-y ${
              formErrors.message ? 'border-rose-500/50 ring-2 ring-rose-500/10' : 'border-gold/10'
            }`}
          />
          {formErrors.message && (
            <p className="text-rose-400 text-xs font-semibold leading-normal flex items-center gap-1 mt-0.5 font-mono">
              ⚠️ {formErrors.message}
            </p>
          )}
        </div>

        {/* Math Captcha Shield Challenge */}
        <div className="flex flex-col gap-1.5 p-3.5 bg-dark-surface/40 border border-gold/10 rounded-xl">
          <label className="text-[11px] text-gold font-mono tracking-widest uppercase block">
            Mathematische Spam-Verifizierung
          </label>
          <div className="flex items-center gap-4">
            <div className="text-sm font-serif font-bold text-gray-200 bg-dark-bg px-4 py-2 rounded-lg border border-gold/5 min-w-[120px] text-center flex items-center justify-center gap-2">
              <span>{mathNumA} + {mathNumB} = ?</span>
              <button
                type="button"
                onClick={generateCaptcha}
                title="Anderes Rechenrätsel laden"
                className="text-gray-500 hover:text-gold transition-colors duration-200 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 hover:rotate-180 transition-transform duration-300" />
              </button>
            </div>
            
            <input
              type="number"
              name="captchaAnswer"
              required
              placeholder="Antwort"
              value={formValues.captchaAnswer}
              onChange={handleInputChange}
              className={`w-28 bg-dark-bg/85 border text-gray-100 rounded-lg py-2 px-3 text-sm text-center outline-none transition-all duration-200 placeholder-gray-600 focus:border-gold/60 focus:ring-2 focus:ring-gold/10 ${
                formErrors.captcha ? 'border-rose-500/50 ring-2 ring-rose-500/10' : 'border-gold/10'
              }`}
            />
          </div>
          {formErrors.captcha && (
            <p className="text-rose-400 text-xs font-semibold leading-normal flex items-center gap-1 mt-1 font-mono">
              ⚠️ {formErrors.captcha}
            </p>
          )}
        </div>

        {/* Golden Glass Submit Trigger Button */}
        <button
          type="submit"
          disabled={isSending}
          className="w-full h-12 rounded-lg text-sm font-semibold tracking-wide flex items-center justify-center cursor-pointer glass-glow-button hover:opacity-90 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed uppercase font-sans border-0"
        >
          {isSending ? (
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-4 h-4 animate-spin text-dark-bg" />
              <span>Übertrage nachricht...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Send className="w-4 h-4 text-dark-bg" />
              <span>Nachricht Absenden</span>
            </div>
          )}
        </button>

        <p className="text-[10px] text-gray-500 leading-relaxed text-center font-sans tracking-wide">
          Mit der Übermittlung stimmen Sie zu, dass IP- und Routingdaten zur Eindämmung von Botangriffen verarbeitet werden.
        </p>
      </form>
    </div>
  );
}
