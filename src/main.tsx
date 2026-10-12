import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'material-symbols/outlined.css'

import App from './App'
import './assets/styles/global.scss'

const container = document.getElementById('root')
if (!container) {
  throw new Error('[pc] #root not found')
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
