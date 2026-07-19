import { Component } from 'react'
import type { ReactNode } from 'react'
import { useI18n } from '../i18n/LocaleContext'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

function ErrorFallback() {
  const { t } = useI18n()
  return (
    <div className="text-center animate-fade-in p-12">
      <p className="text-rose-400 text-xl mb-4">{t('errorOccurred')}</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-gradient-to-l from-blue-500 to-indigo-600 text-white font-bold py-3 px-6 rounded-xl cursor-pointer"
      >
        {t('reload')}
      </button>
    </div>
  )
}

class ErrorBoundaryClass extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) return <ErrorFallback />
    return this.props.children
  }
}

export function ErrorBoundary({ children }: Props) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>
}
