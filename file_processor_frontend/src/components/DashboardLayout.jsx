import React, { useState } from 'react';
import { LayoutDashboard, Zap, Activity, FileText, Scissors, ImagePlus, Code, User, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import FileProcessorCard from './FileProcessorCard';
import AudioTranscribeCard from './AudioTranscribeCard';
import ChatDocumentCard from './ChatDocumentCard';

export default function DashboardLayout() {
  const [activeView, setActiveView] = useState('dashboard');

  const tools = {
    'file-processor': {
      component: <FileProcessorCard />,
      title: "Process smarter.",
      desc: "Intelligent compression, conversion, and resizing. Just drop your file and let AI do the rest.",
      badge: "AI Powered Workspace",
      icon: <Zap className="w-6 h-6" />,
      color: "indigo"
    },
    'audio-transcriber': {
      component: <AudioTranscribeCard />,
      title: "Transcribe audio.",
      desc: "Upload meeting recordings or voice notes. Lightning-fast AI transcription to text.",
      badge: "AI Audio Workspace",
      icon: <Activity className="w-6 h-6" />,
      color: "cyan"
    },
    'chat-document': {
      component: <ChatDocumentCard />,
      title: "Chat with your PDF.",
      desc: "Upload a large technical manual or contract, and ask questions contextually in seconds.",
      badge: "AI Retrieval Workspace",
      icon: <FileText className="w-6 h-6" />,
      color: "blue"
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
    <div className="min-h-screen bg-[#0A0A1A] flex font-sans text-zinc-100 selection:bg-indigo-500/30 selection:text-white">
      
      {/* Aurora Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/8 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-600/5 rounded-full blur-[100px]"></div>
      </div>

      {/* 1. SIDEBAR */}
      <motion.aside 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-20 lg:w-64 bg-white/[0.03] backdrop-blur-xl border-r border-white/[0.06] flex flex-col hidden md:flex transition-all duration-300 z-10 sticky top-0 h-screen"
      >
        <div className="p-6 flex items-center justify-center lg:justify-start gap-3">
          <div className="w-10 h-10 bg-white/[0.06] rounded-[1rem] flex items-center justify-center shadow-sm shrink-0 overflow-hidden ring-1 ring-white/[0.1]">
            <img src="/logo.png" alt="DocuMind Logo" className="w-[140%] h-[140%] object-cover object-center pointer-events-none" />
          </div>
          <motion.span 
             animate={{ backgroundPosition: ['0% 50%', '200% 50%'] }}
             transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
             className="font-extrabold text-xl tracking-tight hidden lg:block bg-gradient-to-r from-white via-indigo-400 to-white bg-[length:200%_auto] bg-clip-text text-transparent drop-shadow-sm"
          >
            DocuMind
          </motion.span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-6">
          <NavItem icon={<LayoutDashboard size={20} strokeWidth={2.5} />} label="Dashboard" active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <NavItem icon={<Zap size={20} />} label="Compress File" active={activeView === 'file-processor'} onClick={() => setActiveView('file-processor')} />
          <NavItem icon={<Activity size={20} />} label="Transcribe" active={activeView === 'audio-transcriber'} onClick={() => setActiveView('audio-transcriber')} />
          <NavItem icon={<FileText size={20} />} label="Chat Doc" active={activeView === 'chat-document'} onClick={() => setActiveView('chat-document')} />
        </nav>
        
        <div className="p-4 mt-auto mb-4 px-4 space-y-1">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest px-3 mb-3">Project & Contact</h3>
           <a href="https://github.com/Aftab073/ai-file-processor" target="_blank" rel="noopener noreferrer" className="block">
              <NavItem icon={<Code size={20} />} label="View Source" isLink />
           </a>
           <a href="https://www.linkedin.com/in/aftabt7" target="_blank" rel="noopener noreferrer" className="block">
              <NavItem icon={<User size={20} />} label="LinkedIn" isLink />
           </a>
           <a href="mailto:tamboliaftab84@gmail.com" className="block">
              <NavItem icon={<Mail size={20} />} label="Contact Me" isLink />
           </a>
        </div>
      </motion.aside>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-y-auto relative z-[1]">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className={`flex-1 mx-auto w-full p-6 lg:p-10 z-0 relative pt-8 lg:pt-16 ${activeView === 'dashboard' ? 'max-w-6xl block' : 'max-w-7xl flex flex-col lg:flex-row items-center lg:items-stretch justify-center gap-10 lg:gap-16'}`}
        >
          {activeView === 'dashboard' ? (
             <DashboardHomeView onNavigate={setActiveView} tools={tools} />
          ) : (
             <>
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
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold tracking-wide uppercase">
                          <SparklesIcon className="w-3.5 h-3.5" />
                          {currentTool.badge}
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                          {currentTool.title}
                        </h1>
                        <p className="text-base lg:text-lg text-zinc-400 max-w-md mx-auto lg:mx-0 font-medium leading-relaxed">
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
                    <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Available Soon</h2>
                    <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1"></div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                    <ComingSoonCard icon={<Scissors className="w-5 h-5" />} title="Split PDF" desc="Extract and sequence pages" />
                    <ComingSoonCard icon={<ImagePlus className="w-5 h-5" />} title="Image Upscaler" desc="AI-driven resolution boost" />
                    <ComingSoonCard icon={<Code className="w-5 h-5" />} title="UI Extractor" desc="Screenshot to React Code" />
                    <ComingSoonCard icon={<Activity className="w-5 h-5" />} title="Sentiment Map" desc="Analyze file tone over time" />
                  </div>
                  
                  <div className="mt-8 p-6 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/5 ring-1 ring-indigo-500/20 text-center flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-20"><SparklesIcon className="w-16 h-16 text-indigo-400" /></div>
                      <h3 className="text-sm font-bold text-zinc-200 mb-1 z-10">We're expanding fast!</h3>
                      <p className="text-xs text-zinc-500 font-medium max-w-[250px] z-10">Our AI toolkit is growing. More premium features are arriving next quarter.</p>
                  </div>
                </motion.div>
             </>
          )}

        </motion.div>
      </main>
    </div>
  );
}

// --- Dashboard View Component ---

function DashboardHomeView({ onNavigate, tools }) {
  return (
      <div className="w-full flex flex-col pt-4 pb-12 w-full mx-auto animate-in fade-in zoom-in-95 duration-500">
         <header className="mb-12 text-center lg:text-left flex flex-col md:flex-row justify-between items-end gap-6">
            <div>
                <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm mb-3">Welcome to DocuMind.</h1>
                <p className="text-zinc-400 text-lg font-medium max-w-xl">Supercharge your files with native AI. Select a workflow below to get started.</p>
            </div>
         </header>

         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            <FeatureCard onClick={() => onNavigate('file-processor')} title="Compress Files" desc="Intelligently compress and process PDF and image files without any native quality loss." icon={tools['file-processor'].icon} color="indigo" />
            <FeatureCard onClick={() => onNavigate('audio-transcriber')} title="Audio Transcribe" desc="Convert large meeting recordings or podcasts to raw text using Whisper AI." icon={tools['audio-transcriber'].icon} color="cyan" />
            <FeatureCard onClick={() => onNavigate('chat-document')} title="Chat with Document" desc="Upload technical manuals and use Groq Llama 3 to contextually extract answers." icon={tools['chat-document'].icon} color="blue" />
         </div>

         <div className="flex items-center gap-4 mb-6">
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Coming Soon in v2.0</h2>
            <div className="h-px bg-gradient-to-r from-white/10 to-transparent flex-1"></div>
         </div>
         
         <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 opacity-70">
            <ComingSoonCard icon={<Scissors className="w-5 h-5"/>} title="Split PDF" desc="Extract and sequence pages" />
            <ComingSoonCard icon={<ImagePlus className="w-5 h-5"/>} title="Image Upscaler" desc="AI-driven resolution boost" />
            <ComingSoonCard icon={<Code className="w-5 h-5"/>} title="UI Extractor" desc="Screenshot to React Code" />
            <ComingSoonCard icon={<Activity className="w-5 h-5"/>} title="Sentiment Map" desc="Analyze file tone over time" />
         </div>
      </div>
  )
}

function FeatureCard({ onClick, title, desc, icon, color }) {
    const colorMap = {
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-400', ring: 'ring-indigo-500/20', hoverBg: 'group-hover:bg-indigo-500/20', glow: 'bg-indigo-500', glowShadow: 'group-hover:shadow-indigo-500/20' },
      cyan:   { bg: 'bg-cyan-500/10', text: 'text-cyan-400', ring: 'ring-cyan-500/20', hoverBg: 'group-hover:bg-cyan-500/20', glow: 'bg-cyan-500', glowShadow: 'group-hover:shadow-cyan-500/20' },
      blue:   { bg: 'bg-blue-500/10', text: 'text-blue-400', ring: 'ring-blue-500/20', hoverBg: 'group-hover:bg-blue-500/20', glow: 'bg-blue-500', glowShadow: 'group-hover:shadow-blue-500/20' },
    };
    const c = colorMap[color];

    return (
        <button onClick={onClick} className={`text-left group relative p-8 bg-white/[0.03] backdrop-blur-sm rounded-[2rem] ring-1 ring-white/[0.08] hover:ring-white/[0.15] hover:shadow-[0_12px_40px_rgb(0,0,0,0.3)] ${c.glowShadow} transition-all duration-300 hover:-translate-y-1.5 overflow-hidden flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-indigo-500`}>
           {/* Glow orb */}
           <div className={`absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl rounded-full ${c.glow} w-48 h-48 -mr-16 -mt-16`} style={{opacity: 'var(--tw-opacity, 0)'}}></div>
           
           <div className={`w-16 h-16 rounded-[1.2rem] ${c.bg} ${c.text} ${c.ring} flex items-center justify-center mb-8 ${c.hoverBg} group-hover:scale-110 transition-all duration-300 ring-1`}>
               {icon}
           </div>
           
           <h3 className="text-xl font-extrabold text-zinc-100 mb-3 group-hover:text-white transition-colors drop-shadow-sm">{title}</h3>
           <p className="text-sm text-zinc-500 font-medium leading-relaxed flex-1">{desc}</p>
           
           <div className={`mt-8 flex items-center text-sm font-bold ${c.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
               Launch Tool <svg className="w-4 h-4 ml-1.5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>
           </div>
        </button>
    )
}

// --- Helper UI Components ---

function SparklesIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function NavItem({ icon, label, active, onClick, isLink }) {
  return (
    <button onClick={onClick} className={`w-full group flex items-center justify-center lg:justify-start gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${active ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20' : 'text-zinc-500 hover:bg-white/[0.05] hover:text-zinc-300 ring-1 ring-transparent hover:ring-white/[0.06]'}`}>
      <span className={`${active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors duration-200`}>
        {icon}
      </span>
      <span className="hidden lg:block">{label}</span>
      {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400 hidden lg:block"></div>}
      {isLink && <div className="ml-auto hidden lg:block opacity-0 group-hover:opacity-100 transition-opacity"><svg className="w-3.5 h-3.5 text-zinc-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg></div>}
    </button>
  );
}

function ComingSoonCard({ icon, title, desc, isAvailable, onClick }) {
  return (
    <div 
      onClick={isAvailable ? onClick : undefined}
      className={`group p-4 bg-white/[0.03] backdrop-blur-sm rounded-2xl ring-1 ring-white/[0.06] overflow-hidden flex items-start text-left transition-all duration-300 hover:-translate-y-0.5 hover:ring-white/[0.12] hover:bg-white/[0.05] ${isAvailable ? 'cursor-pointer hover:ring-indigo-500/30 ring-indigo-500/15' : 'cursor-default'}`}
    >
      <div className={`w-10 h-10 shrink-0 mr-3 rounded-[0.6rem] flex items-center justify-center transition-colors duration-300 ring-1 ${isAvailable ? 'bg-indigo-500/15 text-indigo-400 ring-indigo-500/20' : 'bg-white/[0.04] text-zinc-600 group-hover:text-indigo-400 group-hover:bg-indigo-500/10 ring-white/[0.06] group-hover:ring-indigo-500/20'}`}>
        {icon}
      </div>
      
      <div className="flex-1 mt-0.5">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm font-bold text-zinc-300 transition-colors group-hover:text-zinc-100 leading-none">{title}</h3>
          {!isAvailable && (
            <span className="text-[9px] font-bold tracking-widest text-indigo-400/80 bg-indigo-500/10 px-1.5 py-0.5 rounded uppercase ring-1 ring-indigo-500/20">Soon</span>
          )}
          {isAvailable && (
             <span className="text-[10px] font-bold tracking-wide text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded-md uppercase ring-1 ring-green-500/20">New!</span>
          )}
        </div>
        <p className="text-[11px] font-medium text-zinc-600 leading-snug">{desc}</p>
      </div>
    </div>
  );
}