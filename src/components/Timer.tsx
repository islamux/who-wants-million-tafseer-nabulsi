import { useI18n } from '../i18n/LocaleContext'

const TIMER_DURATION_SECONDS = 30
const TIMER_RADIUS = 60
const TIMER_DIAMETER = TIMER_RADIUS * 2 + 20
const TIMER_STROKE = 6
const TIMER_CIRCUMFERENCE = 2 * Math.PI * TIMER_RADIUS
const COLOR_SAFE = '#ffd700'
const COLOR_WARNING = '#ff8c00'
const COLOR_CRITICAL = '#d31027'
const WARNING_THRESHOLD = 10
const CRITICAL_THRESHOLD = 5

interface Props {
  value: number
  active: boolean
}

export function Timer({ value, active }: Props) {
  const { t } = useI18n()
  if (!active) return null
  const progress = value / TIMER_DURATION_SECONDS
  const offset = TIMER_CIRCUMFERENCE * (1 - progress)
  const color = value > WARNING_THRESHOLD
    ? COLOR_SAFE
    : value > CRITICAL_THRESHOLD
      ? COLOR_WARNING
      : COLOR_CRITICAL

  return (
    <div className="relative flex flex-col items-center my-4 animate-fade-in" style={{ width: TIMER_DIAMETER, height: TIMER_DIAMETER }}>
      <svg width={TIMER_DIAMETER} height={TIMER_DIAMETER} className="transform -rotate-90">
        <circle
          cx={TIMER_DIAMETER / 2}
          cy={TIMER_DIAMETER / 2}
          r={TIMER_RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={TIMER_STROKE}
        />
        <circle
          cx={TIMER_DIAMETER / 2}
          cy={TIMER_DIAMETER / 2}
          r={TIMER_RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={TIMER_STROKE}
          strokeLinecap="round"
          strokeDasharray={TIMER_CIRCUMFERENCE}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-linear"
          style={{ filter: `drop-shadow(0 0 6px ${color})` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-3xl font-bold ${value <= CRITICAL_THRESHOLD ? 'text-red-500 animate-pulse' : 'text-yellow-400'}`}>
          {value}
        </span>
        <span className="text-xs text-gray-400 mt-1">{t('seconds')}</span>
      </div>
    </div>
  )
}
