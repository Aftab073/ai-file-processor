import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Mic, FileAudio, Sparkles, X, CheckCircle2, Copy, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function AudioTranscribeCard() {
  const [step, setStep] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'success'
  const [file, setFile] = useState(null);
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState(null); 
  const [isHovered, setIsHovered] = useState(false);

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error("Invalid file. Please upload MP3, WAV, or M4A under 25MB.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep('ready');
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'audio/mpeg': ['.mp3'],
      'audio/wav': ['.wav'],
      'audio/mp4': ['.m4a']
    },
    maxSize: 25 * 1024 * 1024,
    multiple: false
  });

  const handleTranscribe = async () => {
    if (!file) return;

    setStep('processing');
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('language', language);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setResult({
            text: response.data.text,
            duration: response.data.duration
        });
        setStep('success');
        toast.success("Transcription complete!");
      }
    } catch (error) {
      console.error("Transcription Error:", error);
      toast.error(error.response?.data?.detail || "Failed to transcribe audio.");
      setStep('ready'); // Revert back to ready so user can retry
    }
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setStep('idle');
  };

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      toast.success("Copied to clipboard!");
    }
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.08)]">
      <div className="p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl tracking-tight font-bold text-zinc-900 drop-shadow-sm">
            Transcribe Audio
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 mt-2 font-medium">
            AI-powered speech to text conversion in seconds.
          </p>
        </div>

        <div className="relative min-h-[250px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: IDLE */}
            {step === 'idle' && (
              <motion.div key="idle" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full relative">
                <div 
                  {...getRootProps()} 
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  className={`relative border-2 border-dashed rounded-[1.5rem] p-12 lg:p-16 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group overflow-hidden ${isDragActive || isHovered ? "border-indigo-500 bg-indigo-50/80 scale-[1.02] shadow-[inset_0_4px_30px_rgba(99,102,241,0.1)]" : "border-zinc-200 bg-[#FAFAFA] hover:bg-white hover:border-indigo-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]"}`}
                >
                  <input {...getInputProps()} />
                  
                  {/* The Audio Receptor Core */}
                  <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                     {/* Ripples when dragging */}
                     <AnimatePresence>
                        {(isDragActive || isHovered) && (
                          <>
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 2.5, opacity: [0, 0.5, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }} className="absolute inset-0 bg-indigo-400 rounded-full" />
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 3.5, opacity: [0, 0.3, 0] }} transition={{ duration: 1.5, delay: 0.2, repeat: Infinity, ease: 'easeOut' }} className="absolute inset-0 border border-indigo-500 rounded-full" />
                            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 4.5, opacity: [0, 0.1, 0] }} transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, ease: 'easeOut' }} className="absolute inset-0 bg-indigo-200 rounded-full" />
                          </>
                        )}
                     </AnimatePresence>
                     
                     <div className={`relative z-10 w-full h-full bg-white rounded-2xl shadow-sm ring-1 ring-zinc-100 flex items-center justify-center transition-transform duration-500 ease-out ${isDragActive || isHovered ? 'scale-110 shadow-indigo-200 ring-indigo-200 ring-2' : 'group-hover:scale-105'}`}>
                        <Mic className={`w-8 h-8 transition-colors duration-300 ${isDragActive || isHovered ? "text-indigo-600 animate-pulse" : "text-zinc-400 group-hover:text-indigo-500"}`} />
                     </div>
                  </div>

                  <p className={`text-lg font-bold transition-colors duration-300 z-10 text-center ${isDragActive || isHovered ? "text-indigo-700" : "text-zinc-800"}`}>
                    {isDragActive || isHovered ? "Ready to transcribe..." : "Drag & drop your voice note here"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 font-medium text-center z-10">Supports MP3, WAV, M4A up to 25MB</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: READY */}
            {step === 'ready' && file && (
              <motion.div key="ready" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <div className="flex items-center justify-between p-4 mb-6 bg-white ring-1 ring-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl group">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="bg-indigo-50/50 p-2.5 rounded-xl shadow-sm border border-indigo-100/50 group-hover:scale-105 transition-transform duration-300">
                      <FileAudio className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="text-left overflow-hidden">
                      <p className="text-sm font-semibold text-zinc-900 truncate max-w-[220px] sm:max-w-[300px]">{file.name}</p>
                      <p className="text-xs text-zinc-500 font-medium mt-0.5">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button onClick={() => { setFile(null); setStep('idle'); }} className="p-2 text-zinc-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-100">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-8 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sparkles className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-indigo-600" />
                  </div>
                  <select
                    className="block w-full pl-12 pr-4 py-4 ring-1 ring-zinc-200 rounded-2xl leading-5 bg-[#FAFAFA] hover:bg-white text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300 appearance-none cursor-pointer"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                     <option value="English">English (Faster Default)</option>
                     <option value="Auto">Auto-Detect Language</option>
                     <option value="French">French</option>
                     <option value="Spanish">Spanish</option>
                  </select>
                </div>

                <button
                  onClick={handleTranscribe}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                >
                  Generate Transcript
                </button>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING */}
            {step === 'processing' && (
              <motion.div key="processing" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col items-center justify-center py-8">
                <div className="relative mb-4">
                  {/* Glowing background */}
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-15 animate-pulse"></div>
                  
                  {/* Ambient Liquid Core Container */}
                  <div className="h-28 w-28 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-zinc-100/50 rounded-[2rem] flex items-center justify-center relative overflow-hidden z-10 p-4">
                     
                     {/* Base Glow Layer */}
                     <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="w-16 h-16 bg-indigo-400/20 rounded-full blur-xl animate-pulse"></div>
                     </div>

                     {/* The Primary Liquid Blob */}
                     <motion.div 
                       animate={{ 
                         rotate: [0, 360],
                         borderRadius: [
                           "60% 40% 30% 70% / 60% 30% 70% 40%",
                           "30% 70% 70% 30% / 30% 30% 70% 70%",
                           "60% 40% 30% 70% / 60% 30% 70% 40%"
                         ]
                       }}
                       transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                       className="w-16 h-16 bg-gradient-to-tr from-indigo-500 via-purple-500 to-indigo-300 shadow-[0_0_20px_rgba(99,102,241,0.5)] mix-blend-multiply saturate-150 absolute"
                     />

                     {/* The Secondary Reverse Liquid Blob */}
                     <motion.div 
                       animate={{ 
                         rotate: [360, 0],
                         borderRadius: [
                           "40% 60% 70% 30% / 40% 50% 60% 50%",
                           "50% 50% 20% 80% / 20% 80% 50% 50%",
                           "40% 60% 70% 30% / 40% 50% 60% 50%"
                         ]
                       }}
                       transition={{ duration: 3.5, repeat: Infinity, ease: "linear" }}
                       className="w-14 h-14 bg-gradient-to-br from-blue-400 to-indigo-400 shadow-[0_0_15px_rgba(59,130,246,0.4)] mix-blend-multiply opacity-80 saturate-150 absolute"
                     />

                     {/* Center Mic icon riding the liquid */}
                     <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none drop-shadow-md">
                        <Mic className="w-5 h-5 text-white/90 animate-pulse" />
                     </div>
                  </div>
                </div>
                <p className="mt-6 text-base font-semibold text-zinc-900">AI is listening...</p>
                <p className="mt-1.5 text-sm text-zinc-500 font-medium">Extracting words from your audio.</p>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && result && (
              <motion.div key="success" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full text-center">
                
                <div className="flex items-center justify-between mb-4 px-2">
                   <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-500" />
                      <h3 className="text-sm font-bold text-zinc-900">Transcript Ready</h3>
                   </div>
                   <span className="text-xs font-semibold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">{result.duration}</span>
                </div>
                
                {/* Scrollable Text Area */}
                <div className="w-full bg-[#FAFAFA] ring-1 ring-zinc-200 rounded-2xl p-5 mb-6 text-left shadow-inner">
                    <p className="text-sm text-zinc-700 leading-relaxed h-32 overflow-y-auto pr-2 custom-scrollbar font-medium">
                        {result.text}
                    </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleCopy}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <Copy className="w-5 h-5 mr-2" />
                    Copy to Clipboard
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-base font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-200"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Transcribe new file
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
