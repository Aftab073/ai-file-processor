import React from 'react'
import { Toaster } from 'sonner'
import DashboardLayout from './components/DashboardLayout'

function App() {
  return (
    <>
      <Toaster position="top-right" richColors />
      <DashboardLayout />
    </>
  )
}

export default App