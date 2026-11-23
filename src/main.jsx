import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { InstallProvider } from './context/InstallContext.jsx'
import { PlacesProvider } from './context/PlacesContext.jsx'
import { ToastProvider } from './context/ToastContext.jsx'
import { UpdateProvider } from './context/UpdateContext.jsx'
import { VisitsProvider } from './context/VisitsContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UpdateProvider>
      <InstallProvider>
        <ToastProvider>
          <PlacesProvider>
            <VisitsProvider>
              <App />
            </VisitsProvider>
          </PlacesProvider>
        </ToastProvider>
      </InstallProvider>
    </UpdateProvider>
  </StrictMode>,
)
