import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import './assets/styles/global.scss'

const container = document.getElementById('root')
if (!container) {
  throw new Error('[pc] #root not found')
}

createRoot(container).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
