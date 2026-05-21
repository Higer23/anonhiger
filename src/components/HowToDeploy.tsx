/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Copy, Check, FileText, ChevronRight, CheckCircle, Smartphone } from 'lucide-react';

export default function HowToDeploy() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const folderStructureText = `nachrichtenportal/
├── index.html       # Das Haupt-Kontaktformular (mit Glassmorphismus-Design)
├── 404.html         # Graceful-Routing für GitHub Pages
├── sw.js            # Service Worker (Stale-While-Revalidate optimiert!)
├── manifest.json    # Progressive Web App (PWA) Konfigurationsdatei
└── icons/           # App-Symbole für Homescreens & Lade-Bildschirme
    ├── icon-192.png
    └── icon-512.png`;

  const readmeContentText = `# 📬 Nachrichtenportal (PWA Contact Portal)

Ein professionelles, deutschsprachiges Web-Kontaktformular als Progressive Web App (PWA) mit Discord-Webhook-Übertragung, optimiert nach den Richtlinien des **Freiherr-vom-Stein Gymnasiums**.

---

## 🌟 Hauptfunktionen (Features)

- **Freiherr-vom-Stein Stil** — Luxuriöses Glassmorphism-Design mit samtschwarzem Hintergrund und edlen Goldschliff-Elementen.
- **Discord-Webhook-Transfer** — Empfange Nachrichten live in Echtzeit als formatiertes Rich-Embed mit Geräte- und IP-Telemetrie.
- **Spam-Schutz & Bot-Bremse** — Integrierter Honeypot, mathematische Captcha-Abfragen und Rate-Limiting (max. 3 Nachrichten pro Stunde).
- **Protokoll & Verlauf** — Lokale Speicherung gesendeter Nachrichten im \`localStorage\` zur einfachen Verfolgung.
- **Service Worker (Performance)** — Stale-While-Revalidate Caching-Strategie für sofortige Offline-Ladezeiten und Ausfallschutz.
- **PWA-Konform** — Direkt über Chrome oder Safari installierbar als vollwertige App mit Startsymbol auf Android- & iOS-Modulen.

---

## ⚙️ Lokale Konfiguration

Öffnen Sie die \`index.html\` und passen Sie die Webhook-Parameter an:
\`\`\`javascript
const WEBHOOK_URL  = "DEIN_DISCORD_WEBHOOK_URL";
const COOLDOWN_MS  = 60000;       // Pausezeit zwischen zwei Sendungen (60s)
const MAX_PER_HOUR = 3;           // Höchstens 3 Übermittlungen pro Stunde
\`\`\`

---

## 🚀 Deployment auf GitHub Pages

1. Erstellen Sie ein neues GitHub Repository (z.B. \`nachrichtenportal\`).
2. Laden Sie alle Dateien (\`index.html\`, \`404.html\`, \`sw.js\`, \`manifest.json\` und das \`icons\`-Verzeichnis) hoch.
3. Gehen Sie auf **Settings (Einstellungen) -> Pages**.
4. Wählen Sie unter **Build and deployment** die Option **Branch: main** und den Ordner **/ (root)**.
5. Speichern Sie. Ihre progressive Web-App ist nach kurzem Compile unter \`https://DEINGITHUBUSERID.github.io/nachrichtenportal/\` erreichbar.

> **Offline-Hinweis:** Progressive Web App Service-Worker verlangen standardmäßig eine sichere HTTPS-Verschlüsselung. GitHub Pages liefert dies vollautomatisch aus!

---

*Freiherr-vom-Stein-Gymnasium Edition – Stilvoll, sicher und performant.*`;

  return (
    <div className="glass-glow-card rounded-xl p-5 space-y-6">
      <div className="flex items-center gap-3">
        <Smartphone className="w-5 h-5 text-gold" />
        <h2 className="font-serif text-base font-semibold text-gray-100">
          GitHub Pages & PWA-Bereitstellungshandbuch
        </h2>
      </div>

      <p className="text-xs text-gray-400 leading-relaxed font-sans">
        Um dieses Portal direkt auf Ihrem persönlichen GitHub-Pages-Konto zu deployen, erstellen Sie ein Repository und übertragen Sie die folgenden optimierten Strukturen. Die React App im AI Studio kompiliert diese Ressourcen direkt mit.
      </p>

      {/* Recommended Folder Structure */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono text-gold uppercase tracking-wider flex items-center gap-1.5">
            <ChevronRight className="w-3.5 h-3.5" />
            Empfohlene Dateistruktur
          </span>
          <button
            onClick={() => copyToClipboard(folderStructureText, 1)}
            className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 cursor-pointer"
            type="button"
          >
            {copiedIndex === 1 ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Kopieren</span>
              </>
            )}
          </button>
        </div>
        <pre className="p-3 bg-dark-bg/80 border border-gold/10 rounded-lg text-xs font-mono text-gray-300 overflow-x-auto whitespace-pre leading-relaxed">
          {folderStructureText}
        </pre>
      </div>

      {/* README.md preview and copy */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-[11px] font-mono text-gold uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" />
            Optimierte README.md
          </span>
          <button
            onClick={() => copyToClipboard(readmeContentText, 2)}
            className="text-[10px] text-gray-400 hover:text-gold flex items-center gap-1 cursor-pointer"
            type="button"
          >
            {copiedIndex === 2 ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Kopiert!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>README kopieren</span>
              </>
            )}
          </button>
        </div>
        <div className="max-h-56 overflow-y-auto p-3 bg-dark-bg/60 border border-gold/10 rounded-lg text-xs text-gray-400 font-mono select-all leading-normal">
          {readmeContentText}
        </div>
      </div>

      {/* Deployment steps checklist */}
      <div className="p-4 bg-gold/5 border border-gold/10 rounded-lg space-y-2">
        <h4 className="text-xs font-semibold text-gold flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4" />
          Optimaler GitHub-Leitfaden
        </h4>
        <ul className="text-[11px] text-gray-300 space-y-2 list-disc pl-4 font-sans leading-relaxed">
          <li>
            <strong className="text-gold">404.html Nutzen:</strong> Da GitHub-Pages standardmäßig Single-Page URLs bei Neuladen ablehnt, leitet unsere maßgeschneiderte <code className="text-gold bg-dark-bg/45 px-1 rounded font-mono">404.html</code> Fehleintritte augenblicklich wieder zurück.
          </li>
          <li>
            <strong className="text-gold">Sicherheitserwägung:</strong> Da clientseitige Discord Webhooks öffentlich auf GitHub einsehbar sein können, empfehlen wir, das Repository als <em className="text-gray-100">private</em> anzulegen oder eine Weiterleitungs-API zu nutzen.
          </li>
          <li>
            <strong className="text-gold">Service Worker Geltung:</strong> Lokale Cookies und der Service Worker gelingen ausschließlich unter <code className="text-emerald-400">https://</code> oder localhost. GitHub Pages sichert dies selbstständig.
          </li>
        </ul>
      </div>
    </div>
  );
}
