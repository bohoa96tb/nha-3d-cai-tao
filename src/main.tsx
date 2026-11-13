import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'

const goc = document.getElementById('root')
if (!goc) throw new Error('Không tìm thấy phần tử #root')

createRoot(goc).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
