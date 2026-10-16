import { useState, useEffect } from 'react';
import { Settings2, X, Check, Server, RefreshCw, AlertTriangle } from 'lucide-react';
import {
  DEFAULT_API_BASE_URL,
  LOCAL_DEV_API_BASE_URL,
  getApiBaseUrl,
  setApiBaseUrl,
  testApiConnection,
} from '../services/pokemonApi';
import { PokeBallIcon } from './PokeBallIcon';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUrlChanged?: () => void;
}

export function ApiSettingsModal({ isOpen, onClose, onUrlChanged }: ApiSettingsModalProps) {
  const [currentUrl, setCurrentUrl] = useState(getApiBaseUrl());
  const [customInput, setCustomInput] = useState(getApiBaseUrl());
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success?: boolean;
    message?: string;
    latencyMs?: number;
    count?: number;
  } | null>(null);

  useEffect(() => {
    if (isOpen) {
      const active = getApiBaseUrl();
      setCurrentUrl(active);
      setCustomInput(active);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTest = async (urlToTest: string) => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await testApiConnection(urlToTest);
      setTestResult(result);
    } finally {
      setIsTesting(false);
    }
  };

  const handleApply = (urlToApply: string) => {
    setApiBaseUrl(urlToApply);
    setCurrentUrl(urlToApply);
    if (onUrlChanged) {
      onUrlChanged();
    }
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-3xl w-full max-w-lg p-6 shadow-2xl text-[var(--color-text)] transition-colors">
        <div className="flex items-center justify-between pb-4 border-b border-[var(--color-border)]">
          <div className="flex items-center gap-2.5">
            <PokeBallIcon size={24} />
            <h2 id="api-settings-title" className="text-lg font-black tracking-tight">
              Pokédex API Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-[var(--color-text-secondary)] hover:text-[var(--color-text)] rounded-xl hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4 text-sm">
          <p className="text-[var(--color-text-secondary)] text-xs leading-relaxed">
            Configure the Pokémon API backend. Select between the public verified production cluster or your local development server.
          </p>

          <div className="space-y-2">
            <label className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Preset Clusters
            </label>
            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  setCustomInput(DEFAULT_API_BASE_URL);
                  handleTest(DEFAULT_API_BASE_URL);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  customInput === DEFAULT_API_BASE_URL
                    ? 'border-[#E53935] bg-[#E53935]/10 text-[var(--color-text)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] hover:border-[#E53935]/50 text-[var(--color-text-secondary)]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-[var(--color-text)]">
                    Production API (Default)
                    {currentUrl === DEFAULT_API_BASE_URL && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-[var(--color-text-secondary)] mt-0.5 truncate max-w-sm">
                    {DEFAULT_API_BASE_URL}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setCustomInput(LOCAL_DEV_API_BASE_URL);
                  handleTest(LOCAL_DEV_API_BASE_URL);
                }}
                className={`flex items-center justify-between p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                  customInput === LOCAL_DEV_API_BASE_URL
                    ? 'border-[#E53935] bg-[#E53935]/10 text-[var(--color-text)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface-secondary)] hover:border-[#E53935]/50 text-[var(--color-text-secondary)]'
                }`}
              >
                <div>
                  <div className="font-bold text-xs flex items-center gap-1.5 text-[var(--color-text)]">
                    Local Development Host
                    {currentUrl === LOCAL_DEV_API_BASE_URL && (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-1.5 py-0.2 rounded font-mono font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-xs font-mono text-[var(--color-text-secondary)] mt-0.5">
                    {LOCAL_DEV_API_BASE_URL}
                  </div>
                </div>
              </button>
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="custom-url-input" className="text-[11px] font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Endpoint Endpoint URL
            </label>
            <input
              id="custom-url-input"
              type="url"
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[#E53935]"
            />
          </div>

          {testResult && (
            <div
              className={`p-3 rounded-2xl text-xs flex items-start gap-2 border ${
                testResult.success
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400'
              }`}
            >
              {testResult.success ? (
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              )}
              <div className="flex-1">
                <div className="font-bold">{testResult.message}</div>
                {testResult.count !== undefined && (
                  <div className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                    Available Pokémon records: {testResult.count.toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between pt-4 border-t border-[var(--color-border)]">
          <button
            type="button"
            onClick={() => handleTest(customInput)}
            disabled={isTesting || !customInput.trim()}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-[var(--color-text)] bg-[var(--color-surface-secondary)] border border-[var(--color-border)] rounded-xl hover:border-[#E53935] transition-colors cursor-pointer disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>Test Connection</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-semibold text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleApply(customInput)}
              className="px-4 py-2 text-xs font-bold text-white bg-[#E53935] hover:bg-[#C62828] active:scale-95 rounded-xl transition-all shadow-sm cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
