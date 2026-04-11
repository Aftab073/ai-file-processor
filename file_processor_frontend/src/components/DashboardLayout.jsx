import React, { useState } from 'react';
import { LayoutDashboard, Folder, History, Settings, Activity, BarChart2, Clock, FileText, Scissors, ImagePlus } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FileProcessorCard from './FileProcessorCard';
import AudioTranscribeCard from './AudioTranscribeCard';
import ChatDocumentCard from './ChatDocumentCard';
export default function DashboardLayout() {
  const [activeView, setActiveView] = useState('file-processor');

  const tools = {
    'file-processor': {
      component: <FileProcessorCard />,
      title: "Process smarter.",
      desc: "Intelligent compression, conversion, and resizing. Just drop your file and let AI do the rest.",
      badge: "AI Powered Workspace"
    },
    'audio-transcriber': {
      component: <AudioTranscribeCard />,
      title: "Transcribe audio.",
      desc: "Upload meeting recordings or voice notes. Lightning-fast AI transcription to text.",
      badge: "AI Audio Workspace"
    },
    'chat-document': {
      component: <ChatDocumentCard />,
      title: "Chat with your PDF.",
      desc: "Upload a large technical manual or contract, and ask questions contextually in seconds.",
      badge: "AI Retrieval Workspace"
    }
  };

  const currentTool = tools[activeView] || tools['file-processor'];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex font-sans text-zinc-900 selection:bg-indigo-100 selection:text-indigo-900">
      
      {/* 1. SIDEBAR */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-20 lg:w-64 bg-white/80 backdrop-blur-md border-r border-zinc-100 flex flex-col hidden md:flex transition-all duration-300 z-10 sticky top-0 h-screen"
      >
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-600/20 shrink-0">
            <SparklesIcon className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight hidden lg:block text-zinc-800">TinyLink</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem icon={<LayoutDashboard size={20} strokeWidth={2.5} />} label="Workspace" active={activeView === 'file-processor'} onClick={() => setActiveView('file-processor')} />
          <NavItem icon={<Activity size={20} />} label="Transcribe" active={activeView === 'audio-transcriber'} onClick={() => setActiveView('audio-transcriber')} />
          <NavItem icon={<FileText size={20} />} label="Chat Doc" active={activeView === 'chat-document'} onClick={() => setActiveView('chat-document')} />
          <NavItem icon={<Folder size={20} />} label="Files" />
          <NavItem icon={<History size={20} />} label="History" />
        </nav>
        
        <div className="p-4 mt-auto mb-4 px-4">
           <NavItem icon={<Settings size={20} />} label="Settings" />
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative">
        {/* Subtle top decoration for Apple-like Clean UI */}
        <div className="absolute top-0 inset-x-0 h-64 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none"></div>
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex-1 max-w-7xl mx-auto w-full p-6 lg:p-10 z-0 relative flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-10 lg:gap-16 pt-8 lg:pt-16"
        >
          
          {/* Left Side: Hero Active Tool */}
          <motion.div variants={itemVariants} className="w-full lg:w-1/2 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
            <AnimatePresence mode="wait">
              <motion.div 
                key={activeView}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full flex flex-col items-center lg:items-start"
              >
                <header className="mb-8 space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold tracking-wide uppercase shadow-sm">
                    <SparklesIcon className="w-3.5 h-3.5" />
                    {currentTool.badge}
                  </div>
                  <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-zinc-900 drop-shadow-sm">
                    {currentTool.title}
                  </h1>
                  <p className="text-base lg:text-lg text-zinc-500 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
                    {currentTool.desc}
                  </p>
                </header>

                <div className="w-full max-w-xl">
                   {currentTool.component}
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Right Side: Showcase */}
          <motion.div variants={itemVariants} className="w-full lg:w-5/12 flex flex-col justify-center max-w-xl">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Available Soon</h2>
              <div className="h-px bg-gradient-to-r from-zinc-200 to-transparent flex-1"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              <ComingSoonCard icon={<FileText className="w-5 h-5" />} title="Chat with Doc" desc="AI-driven contextual PDF chat" isAvailable={true} onClick={() => setActiveView('chat-document')} />
              <ComingSoonCard icon={<Scissors className="w-5 h-5" />} title="Split PDF" desc="Extract and sequence pages" />
              <ComingSoonCard icon={<ImagePlus className="w-5 h-5" />} title="Image Upscaler" desc="AI-driven resolution boost" />
              <ComingSoonCard icon={<Activity className="w-5 h-5" />} title="Audio Transcribe" desc="Convert speech to text via AI" isAvailable={true} onClick={() => setActiveView('audio-transcriber')} />
            </div>
            
            <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-50/50 to-white ring-1 ring-indigo-100/50 text-center flex flex-col items-center justify-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-50"><SparklesIcon className="w-16 h-16 text-indigo-200" /></div>
                <h3 className="text-sm font-bold text-zinc-800 mb-1 z-10">We're expanding fast!</h3>
                <p className="text-xs text-zinc-500 font-medium max-w-[250px] z-10">Our AI toolkit is growing. More premium features are arriving next quarter.</p>
            </div>
          </motion.div>

        </motion.div>
      </main>
    </div>
  );
}

// --- Helper UI Components for the Dashboard ---

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function NavItem({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`w-full group flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-indigo-50 text-indigo-700 shadow-sm ring-1 ring-indigo-100' : 'text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 hover:shadow-sm ring-1 ring-transparent hover:ring-zinc-200/50'}`}>
      <span className={`${active ? 'text-indigo-600' : 'text-zinc-400 group-hover:text-zinc-600'} transition-colors duration-200`}>
        {icon}
      </span>
      <span className="hidden lg:block">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-600 hidden lg:block"></div>}
    </button>
  );
}

function ComingSoonCard({ icon, title, desc, isAvailable, onClick }) {
  return (
    <div 
      onClick={isAvailable ? onClick : undefined}
      className={`group p-4 bg-white rounded-2xl shadow-sm ring-1 ring-zinc-100/60 overflow-hidden flex items-start text-left transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 hover:ring-indigo-100 ${isAvailable ? 'cursor-pointer hover:ring-indigo-300 ring-2 ring-indigo-500/20' : 'cursor-default'}`}
    >
      <div className={`w-10 h-10 shrink-0 mr-3 rounded-[0.6rem] flex items-center justify-center transition-colors duration-300 ring-1 ${isAvailable ? 'bg-indigo-50 text-indigo-500 ring-indigo-200' : 'bg-zinc-50 text-zinc-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 ring-zinc-100 group-hover:ring-indigo-200/50'}`}>
        {icon}
      </div>
      
      <div className="flex-1 mt-0.5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-zinc-800 transition-colors group-hover:text-indigo-950 leading-none">{title}</h3>
          {!isAvailable && (
            <span className="text-[9px] font-bold tracking-widest text-indigo-500/80 bg-indigo-50/50 px-1.5 py-0.5 rounded uppercase ring-1 ring-indigo-500/10">Soon</span>
          )}
          {isAvailable && (
             <span className="text-[10px] font-bold tracking-wide text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md uppercase ring-1 ring-green-500/20">New!</span>
          )}
        </div>
        <p className="text-[11px] font-medium text-zinc-500 leading-snug">{desc}</p>
      </div>
    </div>
  );
}