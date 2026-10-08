import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import { TRPCProvider } from "@/providers/trpc"
import { ProgressProvider } from "@/lib/progress"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <TRPCProvider>
        <ProgressProvider>
          <App />
        </ProgressProvider>
      </TRPCProvider>
    </BrowserRouter>
  </StrictMode>,
)
