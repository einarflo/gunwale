import React, { useState } from 'react';
import { useI18n } from '../i18n/I18nProvider';

const flagFor = (lang: 'en' | 'nb') => (lang === 'nb' ? '🇳🇴' : '🇬🇧');

const LanguageSwitcher = () => {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-label="Change language"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          border: '2px solid #e5e7eb', borderRadius: 12,
          padding: '4px 8px', background: '#fff', cursor: 'pointer'
        }}
      >
        <span style={{ fontSize: 16 }}>{flagFor(lang)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="#6b7280"><path d="M7 10l5 5 5-5z"/></svg>
      </button>
      {open && (
        <div style={{ position: 'absolute', right: 0, marginTop: 6, background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 10px 24px rgba(0,0,0,0.12)', zIndex: 20 }}>
          {(['en','nb'] as const).map(code => (
            <div key={code} onClick={() => { setLang(code); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px', cursor: 'pointer', fontWeight: 800, color: '#1f2937', background: lang === code ? '#eff6ff' : '#fff' }}>
              <span style={{ fontSize: 16 }}>{flagFor(code)}</span>
              <span>{code.toUpperCase()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSwitcher;
