import React, { useState } from 'react'
import { useAccessibility } from '../context/AccessibilityContext'
import { t } from '../utils/translations'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLanguage, faTextHeight, faEye, faVolumeUp, faTimes, faCog } from '@fortawesome/free-solid-svg-icons'

const AccessibilityToolbar = () => {
  const {
    language,
    setLanguage,
    fontSize,
    setFontSize,
    highContrast,
    setHighContrast,
    ttsEnabled,
    setTtsEnabled,
    speechRate,
    setSpeechRate,
    speak,
    stopSpeaking,
  } = useAccessibility()

  const [isOpen, setIsOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleLanguageChange = (newLang) => {
    setLanguage(newLang)
    if (ttsEnabled) {
      speak(t('accessibility.language', newLang) + ' ' + t('accessibility.title', newLang))
    }
  }

  const handleFontSizeChange = (newSize) => {
    setFontSize(newSize)
    if (ttsEnabled) {
      speak(t('accessibility.fontSize', language) + ' ' + t(`accessibility.${newSize}`, language))
    }
  }

  const handleTtsToggle = () => {
    const newValue = !ttsEnabled
    setTtsEnabled(newValue)
    if (newValue) {
      speak(t('accessibility.tts', language) + ' ' + t('common.on', language))
    } else {
      stopSpeaking()
    }
  }

  return (
    <>
      {/* Floating Accessibility Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-sky-600 hover:bg-sky-700 text-white rounded-full p-4 shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
        aria-label={t('accessibility.title', language)}
        aria-expanded={isOpen}
      >
        <FontAwesomeIcon icon={faCog} className="w-6 h-6" />
      </button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-4 z-50 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg shadow-xl p-4 w-80 max-w-[calc(100vw-2rem)]"
          role="dialog"
          aria-labelledby="accessibility-title"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 id="accessibility-title" className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              {t('accessibility.title', language)}
            </h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              aria-label={t('common.close', language)}
            >
              <FontAwesomeIcon icon={faTimes} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Language Selector */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FontAwesomeIcon icon={faLanguage} className="mr-2" />
                {t('accessibility.language', language)}
              </label>
              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                aria-label={t('accessibility.language', language)}
              >
                <option value="en">English</option>
                <option value="es">Español</option>
                <option value="fr">Français</option>
              </select>
            </div>

            {/* Font Size */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                <FontAwesomeIcon icon={faTextHeight} className="mr-2" />
                {t('accessibility.fontSize', language)}
              </label>
              <div className="flex gap-2">
                {['small', 'medium', 'large', 'extraLarge'].map((size) => (
                  <button
                    key={size}
                    onClick={() => handleFontSizeChange(size)}
                    className={`flex-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      fontSize === size
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                    }`}
                    aria-pressed={fontSize === size}
                  >
                    {t(`accessibility.${size}`, language)}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                <FontAwesomeIcon icon={faEye} className="mr-2" />
                {t('accessibility.highContrast', language)}
              </label>
              <button
                onClick={() => {
                  setHighContrast(!highContrast)
                  if (ttsEnabled) {
                    speak(
                      t('accessibility.highContrast', language) +
                        ' ' +
                        (highContrast ? t('common.off', language) : t('common.on', language))
                    )
                  }
                }}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  highContrast ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={highContrast}
                aria-label={t('accessibility.highContrast', language)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Text-to-Speech Toggle */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm font-medium text-slate-700 dark:text-slate-300">
                <FontAwesomeIcon icon={faVolumeUp} className="mr-2" />
                {t('accessibility.tts', language)}
              </label>
              <button
                onClick={handleTtsToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  ttsEnabled ? 'bg-sky-600' : 'bg-slate-300 dark:bg-slate-600'
                }`}
                role="switch"
                aria-checked={ttsEnabled}
                aria-label={t('accessibility.tts', language)}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ttsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Speech Rate (only show when TTS is enabled) */}
            {ttsEnabled && (
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t('accessibility.speechRate', language)}: {speechRate.toFixed(1)}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                  className="w-full"
                  aria-label={t('accessibility.speechRate', language)}
                />
              </div>
            )}

            {/* Quick TTS Button */}
            {ttsEnabled && (
              <button
                onClick={() => {
                  const mainContent = document.querySelector('main, article, [role="main"]')
                  if (mainContent) {
                    speak(mainContent.innerText || mainContent.textContent)
                  }
                }}
                className="w-full px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-md text-sm font-medium transition-colors"
              >
                {t('accessibility.readPage', language) || 'Read This Page'}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default AccessibilityToolbar
