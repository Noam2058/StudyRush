import { useLang } from '../context/LanguageContext.jsx'
export function LanguageToggle({ variant = 'light' }) {
  const { lang, toggle, t } = useLang()
  return (
    <button onClick={toggle} className={`lang-toggle lang-toggle--${variant}`} aria-label={t('lang.toggleAria')}>
      {t('lang.toggle')}
    </button>
  )
}
