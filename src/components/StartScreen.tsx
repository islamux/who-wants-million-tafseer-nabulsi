import { BookOpen } from 'lucide-react'
import { useI18n } from '../i18n/LocaleContext'

interface Props {
  onStart: (chapterId: number) => void
}

export function StartScreen({ onStart }: Props) {
  const { t, tf, questionsData } = useI18n()
  return (
    <div className="text-center animate-fade-in">
      <img
        src="/million.jpeg"
        alt={t('logoAlt')}
        className="mx-auto mb-6 rounded-2xl border-2 border-yellow-400/50 max-w-xs shadow-2xl shadow-yellow-400/20 animate-float"
      />
      <p className="mb-6 text-xl text-gray-300 animate-fade-in" style={{ animationDelay: '0.3s', animationFillMode: 'both' }}>
        {t('readyPrompt')}
      </p>

      <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-xl shadow-black/20 max-w-2xl mx-auto">
        <div className="mb-5 text-center">
          <h3 className="text-lg font-bold text-yellow-400 flex items-center justify-center gap-2 mb-2">
            <BookOpen size={20} />
            {t('interviewTitle')}
          </h3>
          <p className="text-gray-400 text-xs leading-relaxed max-w-lg mx-auto">
            {t('interviewDesc')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {questionsData.chapterList.map((ch) => (
            <button
              key={ch.id}
              onClick={() => onStart(ch.id)}
              className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl p-4 text-center transition-all duration-300 hover:bg-yellow-400/10 hover:border-yellow-400/50 hover:-translate-y-1 hover:shadow-lg hover:shadow-yellow-400/10 cursor-pointer group"
            >
              <div className="text-yellow-400 font-bold text-sm mb-1 group-hover:text-yellow-300">
                {ch.title}
              </div>
              <div className="text-gray-400 text-xs leading-relaxed group-hover:text-gray-300">
                {tf('roundLabel', questionsData.chapterNames[ch.id] ?? '')}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
