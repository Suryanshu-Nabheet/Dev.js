
import { StrictMode } from 'devjs'
import { createRoot } from 'devjs-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
