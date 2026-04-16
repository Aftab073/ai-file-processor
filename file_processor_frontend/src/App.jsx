import React, { useState } from 'react'
import { Toaster } from 'sonner'
import DashboardLayout from './components/DashboardLayout'
import LandingPage from './components/LandingPage'
import { AnimatePresence, motion } from 'framer-motion'

function App() {
  const [hasStarted, setHasStarted] = useState(false);

  return (
    <>
      <Toaster position="top-right" richColors />
      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4 }}>
             <LandingPage onEnterApp={() => setHasStarted(true)} />
          </motion.div>
        ) : (
          <motion.div key="app" className="h-screen w-full" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
             <DashboardLayout onGoHome={() => setHasStarted(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

export default App