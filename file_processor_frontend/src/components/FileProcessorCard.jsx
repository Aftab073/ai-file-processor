import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, File, Sparkles, X, Loader2, CheckCircle2, Download, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import { cn } from '../lib/utils';

// Your backend URL (make sure your FastAPI server is running!)
const API_BASE_URL = 'http://127.0.0.1:8000';

export default function FileProcessorCard() {
  const [step, setStep] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'success'
  const [file, setFile] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null); // Stores the backend response

  // --- SUBTLE 3D MAGNETIC HOVER ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]); 
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top, width, height } = currentTarget.getBoundingClientRect();
    const x = clientX - left - width / 2;
    const y = clientY - top - height / 2;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0);
    mouseY.set(0);
  }

  // Soft spotlight glow effect
  const glowX = useTransform(mouseX, x => x + 300);
  const glowY = useTransform(mouseY, y => y + 250);
  const background = useMotionTemplate`radial-gradient(500px circle at ${glowX}px ${glowY}px, rgba(99,102,241,0.06), transparent 80%)`;

  // --- DROPZONE LOGIC ---
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error("Invalid file. Please upload a PDF or Image under 10MB.");
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
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf']
    },
    maxSize: 10 * 1024 * 1024,
    multiple: false
  });

  // --- API CALL LOGIC ---
  const handleProcessFile = async () => {
    if (!file || !prompt.trim()) return;

    setStep('processing');
    
    // We must use FormData to send files via HTTP
    const formData = new FormData();
    formData.append('file', file);
    formData.append('prompt', prompt);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/process-file`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      setResult(response.data);
      setStep('success');
      toast.success("File processed successfully!");
      
    } catch (error) {
      console.error("API Error:", error);
      toast.error("Something went wrong processing your file.");
      setStep('ready'); // Revert back so they can try again
    }
  };

  const handleReset = () => {
    setFile(null);
    setPrompt('');
    setResult(null);
    setStep('idle');
  };

  const handleDownload = () => {
    if (result?.file_details?.download_url) {
      // Trigger the download by pointing the browser to our backend download endpoint
      window.open(`${API_BASE_URL}${result.file_details.download_url}`, '_blank');
    }
  };

  // --- ANIMATION VARIANTS (Spring-based for Apple-like feel) ---
  const fadeVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  return (
    <motion.div 
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX: springX, rotateY: springY, transformPerspective: 1000 }}
      transition={{ layout: { type: "spring", stiffness: 350, damping: 30 } }}
      className="group relative w-full max-w-xl mx-auto bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-black/5 overflow-hidden transition-shadow duration-500 hover:shadow-[0_12px_45px_rgb(0,0,0,0.06)]"
    >
      {/* 3D Spotlight Glow */}
      <motion.div 
         className="pointer-events-none absolute -inset-px rounded-[2rem] transition duration-500 opacity-0 group-hover:opacity-100 z-0" 
         style={{ background }} 
      />

      <motion.div layout className="relative z-10 p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl tracking-tight font-bold text-zinc-900 drop-shadow-sm">
            Process a File
          </h2>
          <p className="text-sm sm:text-base text-zinc-500 mt-2 font-medium">
            AI-powered compression, conversion, and resizing.
          </p>
        </div>

        <motion.div layout className="relative flex flex-col items-center justify-center">
          <AnimatePresence mode="popLayout">
            
            {/* STEP 1: IDLE */}
            {step === 'idle' && (
              <motion.div key="idle" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <div 
                  {...getRootProps()} 
                  className={cn(
                    "border-2 border-dashed rounded-[1.5rem] p-12 lg:p-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group",
                    isDragActive ? "border-indigo-500 bg-indigo-50/50 scale-[1.02] shadow-inner" : "border-zinc-200 bg-[#FAFAFA] hover:bg-white hover:border-indigo-300 hover:shadow-[0_4px_20px_rgb(0,0,0,0.03)]"
                  )}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 mb-5 bg-white rounded-2xl shadow-sm ring-1 ring-zinc-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                    <UploadCloud className={cn("w-8 h-8 transition-colors duration-300", isDragActive ? "text-indigo-600" : "text-zinc-400 group-hover:text-indigo-500")} />
                  </div>
                  <p className="text-base font-semibold text-zinc-800">
                    {isDragActive ? "Drop the file here..." : "Drag & drop your file here"}
                  </p>
                  <p className="text-sm text-zinc-500 mt-2 font-medium">Supports PDF, JPG, PNG up to 10MB</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: READY */}
            {step === 'ready' && file && (
              <motion.div key="ready" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <div className="flex items-center justify-between p-4 mb-6 bg-white ring-1 ring-zinc-100 shadow-[0_2px_10px_rgba(0,0,0,0.02)] rounded-2xl group">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="bg-indigo-50/50 p-2.5 rounded-xl shadow-sm border border-indigo-100/50 group-hover:scale-105 transition-transform duration-300">
                      <File className="w-6 h-6 text-indigo-600" />
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
                  <input
                    type="text"
                    className="block w-full pl-12 pr-4 py-4 ring-1 ring-zinc-200 rounded-2xl leading-5 bg-[#FAFAFA] hover:bg-white focus:bg-white text-zinc-900 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-base shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)] transition-all duration-300"
                    placeholder="e.g., Compress this PDF to 2MB"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    autoFocus
                  />
                </div>

                <button
                  onClick={handleProcessFile}
                  disabled={!prompt.trim()}
                  className="w-full flex items-center justify-center py-4 px-4 rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none transition-all duration-300"
                >
                  Process with AI
                </button>
              </motion.div>
            )}

            {/* STEP 3: PROCESSING */}
            {step === 'processing' && (
              <motion.div key="processing" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col items-center justify-center py-8">
                <div className="relative mb-2">
                  {/* Subtle pulsing background glow */}
                  <div className="absolute inset-0 bg-indigo-500 rounded-full blur-3xl opacity-15 animate-pulse"></div>
                  
                  {/* Data Node Disassembly Animation Container */}
                  <div className="w-24 h-24 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-zinc-100/50 rounded-[2rem] flex items-center justify-center relative z-10 group overflow-visible">
                    
                    {/* Outer spinning dash ring */}
                    <motion.div 
                      animate={{ rotate: 360 }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-[-15%] rounded-full border-[1.5px] border-dashed border-indigo-200/60 opacity-60 pointer-events-none"
                    />

                    {/* Central pulsing neural core */}
                    <motion.div 
                       initial={{ scale: 0.8, opacity: 0.7 }}
                       animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.7, 1, 0.7] }}
                       transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                       className="w-10 h-10 rounded-full bg-gradient-to-tr from-indigo-600 to-indigo-400 shadow-[0_0_20px_rgba(79,70,229,0.6)] z-20 flex items-center justify-center relative overflow-hidden"
                    >
                       <File className="w-4 h-4 text-white z-10 absolute" />
                       <motion.div 
                         initial={{ y: "100%" }}
                         animate={{ y: ["100%", "-100%"] }}
                         transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                         className="absolute inset-0 bg-white/20 h-full w-full"
                       />
                    </motion.div>

                    {/* Orbiting data particles */}
                    {[...Array(8)].map((_, i) => (
                       <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(79,70,229,0.8)]"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{
                             x: Math.cos((i * 45) * (Math.PI / 180)) * 40,
                             y: Math.sin((i * 45) * (Math.PI / 180)) * 40,
                             opacity: [0, 1, 0],
                             scale: [0, 1.2, 0]
                          }}
                          transition={{
                             duration: 2.5,
                             repeat: Infinity,
                             delay: i * 0.15,
                             ease: "easeInOut"
                          }}
                       />
                    ))}
                  </div>
                </div>
                <p className="mt-8 text-base font-semibold text-zinc-900">AI is processing your file...</p>
                <p className="mt-1.5 text-sm text-zinc-500 font-medium">This usually takes a few seconds.</p>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && result && (
              <motion.div key="success" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full text-center">
                
                <div className="flex justify-center mb-5">
                  <div className="bg-green-50 p-4 rounded-2xl ring-1 ring-green-100/50 shadow-sm animate-[bounce_1s_ease-out_1]">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-zinc-900 mb-2">Processing Complete!</h3>
                <p className="text-base text-zinc-500 font-medium mb-8">{result.processing_message}</p>

                {/* File Stats Box */}
                <div className="flex justify-center gap-8 p-5 bg-[#FAFAFA] ring-1 ring-zinc-100 rounded-2xl mb-8 shadow-inner">
                  <div className="text-center">
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">Original Size</p>
                    <p className="text-base font-bold text-zinc-800">{result.file_details.original_size_mb} MB</p>
                  </div>
                  <div className="w-px bg-zinc-200"></div>
                  <div className="text-center">
                    <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mb-1.5">New Size</p>
                    <p className="text-base font-bold text-indigo-600">{result.file_details.final_size_mb} MB</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-2xl shadow-[0_4px_14px_rgba(79,70,229,0.3)] text-base font-semibold text-white bg-indigo-600 hover:bg-indigo-700 hover:shadow-[0_6px_20px_rgba(79,70,229,0.4)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download File
                  </button>
                  
                  <button
                    onClick={handleReset}
                    className="w-full flex items-center justify-center py-4 px-4 rounded-2xl text-base font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-200 transition-all duration-200"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Process another file
                  </button>
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}