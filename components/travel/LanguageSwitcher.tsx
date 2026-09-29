'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { Languages, ChevronDown } from 'lucide-react';
import { CanonicalLocale, CANONICAL_LOCALES, I18nService } from '@/lib/i18n/i18n-service';

interface I18nContextType {
  locale: CanonicalLocale;
  setLocale: (locale: CanonicalLocale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  locale: 'en-IN',
  setLocale: () => {},
  t: (key: string) => key,
});

export const useI18n = () => useContext(I18nContext);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<CanonicalLocale>('en-IN');

  useEffect(() => {
    const saved = localStorage.getItem('tp_locale') as CanonicalLocale;
    if (saved && CANONICAL_LOCALES[saved]) {
      setLocaleState(saved);
    }
  }, []);

  const setLocale = (newLocale: CanonicalLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('tp_locale', newLocale);
  };

  const t = (key: string) => I18nService.translate(key, locale);

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const LanguageSwitcher: React.FC = () => {
  const { locale, setLocale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const current = CANONICAL_LOCALES[locale] || CANONICAL_LOCALES['en-IN'];

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition border border-slate-200"
        title="Switch Language / Locale"
      >
        <Languages className="w-3.5 h-3.5 text-sky-600" />
        <span>{current.nativeName}</span>
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in zoom-in-95">
          <div className="px-3 py-1 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50">
            Canonical Locales (§20)
          </div>
          {Object.values(CANONICAL_LOCALES).map((loc) => (
            <button
              key={loc.code}
              type="button"
              onClick={() => {
                setLocale(loc.code);
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs font-semibold flex items-center justify-between hover:bg-sky-50 transition ${
                locale === loc.code ? 'text-sky-600 font-bold bg-sky-50/50' : 'text-slate-700'
              }`}
            >
              <span>{loc.nativeName}</span>
              <span className="text-[10px] text-slate-400 uppercase">{loc.code}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
