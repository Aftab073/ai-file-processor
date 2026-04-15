import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, FileText, Activity, Zap, ArrowRight, ShieldCheck, Zap as FastZap } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage({ onEnterApp }) {
  return (
    <div className="min-h-screen bg-[#0A0A1A] font-sans text-zinc-100 selection:bg-indigo-500/30 selection:text-white overflow-hidden relative flex flex-col">
      
      {/* Aurora Background Orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] right-[20%] w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 py-6 px-6 md:px-12 flex justify-between items-center border-b border-white/[0.06] bg-[#0A0A1A]/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/[0.06] rounded-[1rem] flex items-center justify-center overflow-hidden ring-1 ring-white/[0.1]">
            <img src="/logo.png" alt="DocuMind" className="w-[140%] h-[140%] object-cover object-center pointer-events-none" />
          </div>
          <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white to-indigo-400 bg-clip-text text-transparent">DocuMind</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-400">
          <a href="#features" className="hover:text-zinc-100 transition-colors">Features</a>
          <a href="#about" className="hover:text-zinc-100 transition-colors">About</a>
          <button 
            onClick={onEnterApp}
            className="px-5 py-2.5 bg-white/[0.08] hover:bg-white/[0.12] ring-1 ring-white/[0.1] rounded-xl text-zinc-100 transition-all"
          >
            Sign In
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10 flex flex-col items-center">
        
        {/* HERO SECTION */}
        <section className="w-full max-w-5xl mx-auto px-6 py-20 md:py-32 flex flex-col items-center text-center mt-8 md:mt-12">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="flex flex-col items-center">
            
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs md:text-sm font-semibold tracking-wide uppercase mb-8">
              <Sparkles className="w-4 h-4" />
              <span>Next-Gen Document Intelligence</span>
            </motion.div>

            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-sm max-w-4xl leading-[1.1]">
              Talk to your documents. <br className="hidden md:block"/>
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">Understand anything instantly.</span>
            </motion.h1>

            <motion.p variants={fadeIn} className="mt-8 text-lg md:text-xl text-zinc-400 max-w-2xl font-medium leading-relaxed">
              The ultimate AI workspace for your files. Compress PDFs, transcribe any audio or video link, and chat with massive documents in milliseconds.
            </motion.p>

            <motion.div variants={fadeIn} className="mt-12 flex flex-col sm:flex-row items-center gap-4">
              <button 
                onClick={onEnterApp}
                className="group relative px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold rounded-2xl shadow-[0_0_40px_rgba(79,70,229,0.4)] transition-all duration-300 hover:shadow-[0_0_60px_rgba(79,70,229,0.6)] hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out"></div>
                <span className="relative z-10">Get Started for Free</span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
              </button>
              <div className="text-sm text-zinc-500 font-medium flex items-center gap-2 mt-4 sm:mt-0">
                <ShieldCheck className="w-4 h-4 text-green-400" /> No credit card required
              </div>
            </motion.div>

          </motion.div>
        </section>

        {/* TRUST BAR */}
        <section className="w-full border-y border-white/[0.06] bg-white/[0.01] py-8 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto px-6 flex flex-col items-center">
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-6 text-center">Powered by state-of-the-art AI models</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              <div className="flex items-center gap-2 font-bold text-xl"><FastZap className="w-6 h-6 text-orange-400" /> Groq</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Sparkles className="w-6 h-6 text-blue-400" /> Meta Llama 3</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Activity className="w-6 h-6 text-green-400" /> Whisper AI</div>
            </div>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="w-full max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-zinc-100 mb-4">One workspace. Endless capabilities.</h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">Replace multiple scattered tools with a single unified, ultra-fast AI SaaS platform.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard 
              icon={<FileText className="w-8 h-8 text-indigo-400" />}
              title="Chat with any PDF"
              desc="Don't read 100-page manuals. Upload them and ask questions directly. Get instant, accurate answers with citations."
            />
            <FeatureCard 
              icon={<Activity className="w-8 h-8 text-cyan-400" />}
              title="Audio Transcription"
              desc="Drop a file or paste a YouTube/Instagram link. Whisper AI extracts the audio and provides an instant transcript and summary."
            />
            <FeatureCard 
              icon={<Zap className="w-8 h-8 text-purple-400" />}
              title="Smart File Compression"
              desc="A zero-loss, ultra-fast local compression tool for massive PDFs. Keep the quality, drop the megabytes."
            />
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/[0.06] bg-[#0A0A1A] py-12 relative z-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
             <div className="w-6 h-6 bg-white/[0.06] rounded-md flex items-center justify-center overflow-hidden ring-1 ring-white/[0.1]">
                <img src="/logo.png" alt="DocuMind" className="w-[140%] h-[140%] object-cover object-center pointer-events-none" />
             </div>
             <span className="font-bold text-sm text-zinc-300">DocuMind © {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-6 text-sm font-medium text-zinc-500">
            <a href="#" className="hover:text-zinc-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-zinc-300 transition-colors">Terms</a>
            <a href="https://github.com/Aftab073/ai-file-processor" target="_blank" rel="noopener noreferrer" className="hover:text-zinc-300 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="group p-8 bg-white/[0.03] backdrop-blur-sm rounded-[2rem] ring-1 ring-white/[0.08] hover:ring-white/[0.15] hover:bg-white/[0.05] hover:-translate-y-2 transition-all duration-300 text-left">
      <div className="w-16 h-16 rounded-2xl bg-white/[0.06] ring-1 ring-white/[0.1] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 mix-blend-screen">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-zinc-100 mb-3">{title}</h3>
      <p className="text-sm font-medium text-zinc-400 leading-relaxed">{desc}</p>
    </div>
  );
}
