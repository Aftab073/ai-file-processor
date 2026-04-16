import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { Mic, FileAudio, Sparkles, X, CheckCircle2, Copy, RotateCcw, Download, Link, Upload, Globe } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function AudioTranscribeCard() {
  const [step, setStep] = useState('idle'); // 'idle' | 'ready' | 'processing' | 'success'
  const [inputMode, setInputMode] = useState('file'); // 'file' | 'url'
  const [file, setFile] = useState(null);
  const [url, setUrl] = useState('');
  const [language, setLanguage] = useState('English');
  const [result, setResult] = useState(null); 
  const [isHovered, setIsHovered] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);

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

  const handleUrlSubmit = () => {
    if (!url.trim()) {
      toast.error("Please paste a valid URL.");
      return;
    }
    // Basic URL validation
    try {
      new URL(url.trim());
    } catch {
      toast.error("That doesn't look like a valid URL.");
      return;
    }
    setStep('ready');
  };

  const handleTranscribe = async () => {
    if (inputMode === 'file' && !file) return;
    if (inputMode === 'url' && !url.trim()) return;

    setStep('processing');

    try {
      let response;

      if (inputMode === 'file') {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('language', language);
        response = await axios.post(`${API_BASE_URL}/api/transcribe`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        response = await axios.post(`${API_BASE_URL}/api/transcribe-url`, {
          url: url.trim(),
          language: language,
        });
      }

      if (response.data.status === 'success') {
        setResult({
          text: response.data.text,
          summary: null,
          duration: response.data.duration,
          word_count: response.data.word_count,
          video_title: response.data.video_title || null,
        });
        setStep('success');
        toast.success("Transcription complete!");
      }
    } catch (error) {
      console.error("Transcription Error:", error);
      toast.error(error.response?.data?.detail || "Failed to transcribe. Please try again.");
      setStep('ready');
    }
  };

  const handleReset = () => {
    setFile(null);
    setUrl('');
    setResult(null);
    setStep('idle');
  };

  const handleCopy = () => {
    if (result?.text) {
      navigator.clipboard.writeText(result.text);
      toast.success("Copied to clipboard!");
    }
  };

  const handleSummarize = async () => {
    if (!result?.text || isSummarizing) return;
    setIsSummarizing(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/api/summarize`, {
        text: result.text,
      });
      if (response.data.status === 'success') {
        setResult(prev => ({ ...prev, summary: response.data.summary }));
        toast.success("Summary generated!");
      }
    } catch (error) {
      console.error("Summary Error:", error);
      toast.error("Failed to generate summary.");
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleDownload = () => {
    if (!result?.text) return;
    const content = `${result.summary ? `--- AI SUMMARY ---\n${result.summary}\n\n--- FULL TRANSCRIPT ---\n` : ''}${result.text}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `transcript_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(downloadUrl);
    toast.success("Transcript downloaded!");
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15, ease: 'easeIn' } },
  };

  return (
    <div className="w-full max-w-xl mx-auto bg-white/[0.03] backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-white/[0.08] overflow-hidden transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.3)] hover:ring-white/[0.12]">
      <div className="p-8 sm:p-10">
        
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl tracking-tight font-bold text-zinc-100 drop-shadow-sm">
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
                
                {/* Input Mode Toggle */}
                <div className="flex items-center justify-center mb-6">
                  <div className="inline-flex bg-white/[0.04] rounded-2xl p-1 ring-1 ring-white/[0.08]">
                    <button
                      onClick={() => setInputMode('file')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        inputMode === 'file' 
                          ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Upload className="w-4 h-4" />
                      <span>Upload File</span>
                    </button>
                    <button
                      onClick={() => setInputMode('url')}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                        inputMode === 'url' 
                          ? 'bg-indigo-500/15 text-indigo-400 ring-1 ring-indigo-500/20' 
                          : 'text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      <Link className="w-4 h-4" />
                      <span>Paste URL</span>
                    </button>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  {inputMode === 'file' ? (
                    <motion.div key="file-drop" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                      <div 
                        {...getRootProps()} 
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        className={`relative border-2 border-dashed rounded-[1.5rem] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center transition-all duration-500 cursor-pointer group overflow-hidden ${isDragActive || isHovered ? "border-indigo-500/60 bg-indigo-500/10 scale-[1.02] shadow-[inset_0_4px_30px_rgba(99,102,241,0.15)]" : "border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/30"}`}
                      >
                        <input {...getInputProps()} />
                        
                        {/* The Audio Receptor Core */}
                        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
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
                  ) : (
                    <motion.div key="url-input" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="w-full">
                      <div className="relative border-2 border-dashed rounded-[1.5rem] p-10 lg:p-12 flex flex-col items-center justify-center transition-all duration-500 bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/30 group border-white/[0.1]">
                        
                        <div className="relative w-16 h-16 mb-6 flex items-center justify-center">
                          <div className="w-full h-full bg-white/[0.06] rounded-2xl shadow-sm ring-1 ring-white/[0.1] flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                            <Globe className="w-7 h-7 text-zinc-500 group-hover:text-indigo-400 transition-colors duration-300" />
                          </div>
                        </div>
                        
                        <p className="text-base font-bold text-zinc-300 mb-1">Paste a video or audio URL</p>
                        <p className="text-xs text-zinc-600 font-medium mb-6">YouTube, Instagram, Twitter/X, and 1000+ platforms</p>
                        
                        <div className="w-full flex gap-3">
                          <div className="flex-1 relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <Link className="h-4 w-4 text-zinc-600" />
                            </div>
                            <input
                              type="url"
                              value={url}
                              onChange={(e) => setUrl(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && handleUrlSubmit()}
                              placeholder="https://youtube.com/watch?v=..."
                              className="block w-full pl-11 pr-4 py-3.5 ring-1 ring-white/[0.1] rounded-xl bg-white/[0.04] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium transition-all duration-300"
                            />
                          </div>
                          <button
                            onClick={handleUrlSubmit}
                            disabled={!url.trim()}
                            className="px-5 py-3.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-all duration-300 text-sm shadow-sm hover:shadow-md hover:-translate-y-0.5"
                          >
                            Go
                          </button>
                        </div>

                        <p className="text-[11px] text-zinc-600 font-medium mt-4">⏱ Max 5-minute videos supported on free tier</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}

            {/* STEP 2: READY */}
            {step === 'ready' && (
              <motion.div key="ready" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <div className="flex items-center justify-between p-4 mb-6 bg-white/[0.04] ring-1 ring-white/[0.08] rounded-2xl group">
                  <div className="flex items-center space-x-4 overflow-hidden">
                    <div className="bg-indigo-500/15 p-2.5 rounded-xl border border-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                      {inputMode === 'file' ? (
                        <FileAudio className="w-6 h-6 text-indigo-400" />
                      ) : (
                        <Globe className="w-6 h-6 text-indigo-400" />
                      )}
                    </div>
                    <div className="text-left overflow-hidden">
                      {inputMode === 'file' ? (
                        <>
                          <p className="text-sm font-semibold text-zinc-200 truncate max-w-[220px] sm:max-w-[300px]">{file?.name}</p>
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">{file ? (file.size / (1024 * 1024)).toFixed(2) : 0} MB</p>
                        </>
                      ) : (
                        <>
                          <p className="text-sm font-semibold text-zinc-200 truncate max-w-[220px] sm:max-w-[300px]">{url}</p>
                          <p className="text-xs text-zinc-500 font-medium mt-0.5">URL Transcription</p>
                        </>
                      )}
                    </div>
                  </div>
                  <button onClick={handleReset} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500/20">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="relative mb-8 group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Sparkles className="h-5 w-5 text-indigo-500 transition-transform duration-300 group-focus-within:scale-110 group-focus-within:text-indigo-600" />
                  </div>
                  <select
                    className="block w-full pl-12 pr-4 py-4 ring-1 ring-white/[0.1] rounded-2xl leading-5 bg-white/[0.04] hover:bg-white/[0.06] text-zinc-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 sm:text-base transition-all duration-300 appearance-none cursor-pointer"
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                     <option value="English">English (Faster Default)</option>
                     <option value="Auto">Auto-Detect Language</option>
                     <option value="Hindi">Hindi (हिंदी)</option>
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
                <p className="mt-6 text-base font-semibold text-zinc-900">
                  AI is listening...
                </p>
                <p className="mt-1.5 text-sm text-zinc-500 font-medium">
                  Extracting words and generating your transcript.
                </p>
              </motion.div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 'success' && result && (
              <motion.div key="success" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                
                {/* Header with stats */}
                <div className="flex items-center justify-between mb-5 px-1">
                   <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-green-400" />
                      <h3 className="text-sm font-bold text-zinc-200">Transcript Ready</h3>
                   </div>
                   <div className="flex items-center gap-2">
                     <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">{result.word_count} words</span>
                     <span className="text-[11px] font-semibold text-zinc-400 bg-zinc-100 px-2 py-1 rounded-md">{result.duration}</span>
                   </div>
                </div>

                {/* Video title if URL mode */}
                {result.video_title && (
                  <div className="mb-4 px-1">
                    <p className="text-xs text-zinc-500 font-medium truncate">
                      <span className="text-zinc-400">Source:</span> {result.video_title}
                    </p>
                  </div>
                )}
                
                {/* AI Summary Card — On Demand */}
                {result.summary ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    className="w-full bg-gradient-to-br from-indigo-50 to-purple-50/50 ring-1 ring-indigo-100 rounded-2xl p-5 mb-4 text-left relative overflow-hidden"
                  >
                    <div className="absolute top-2 right-3 opacity-30">
                      <Sparkles className="w-8 h-8 text-indigo-300" />
                    </div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <h4 className="text-xs font-bold text-indigo-700 uppercase tracking-widest">AI Summary</h4>
                    </div>
                    <p className="text-sm text-zinc-700 leading-relaxed font-medium relative z-10">
                      {result.summary}
                    </p>
                  </motion.div>
                ) : (
                  <button
                    onClick={handleSummarize}
                    disabled={isSummarizing}
                    className="w-full flex items-center justify-center gap-2 py-3.5 px-4 mb-4 rounded-2xl text-sm font-semibold text-indigo-700 bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 ring-1 ring-indigo-200 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 disabled:opacity-60 disabled:cursor-wait disabled:hover:translate-y-0"
                  >
                    {isSummarizing ? (
                      <>
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} className="w-4 h-4 border-2 border-indigo-300 border-t-indigo-600 rounded-full" />
                        Generating summary...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Generate AI Summary
                      </>
                    )}
                  </button>
                )}
                
                {/* Full Transcript */}
                <div className="w-full bg-white/[0.04] ring-1 ring-white/[0.08] rounded-2xl p-5 mb-6 text-left">
                    <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">Full Transcript</h4>
                    <p className="text-sm text-zinc-300 leading-relaxed h-32 overflow-y-auto pr-2 custom-scrollbar font-medium">
                        {result.text}
                    </p>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    onClick={handleCopy}
                    className="flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-semibold text-indigo-400 bg-indigo-500/10 hover:bg-indigo-500/20 ring-1 ring-indigo-500/20 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </button>
                  
                  <button
                    onClick={handleDownload}
                    className="flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-[0_4px_14px_rgba(79,70,229,0.3)] hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-300"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download .txt
                  </button>
                </div>
                
                <button
                  onClick={handleReset}
                  className="w-full flex items-center justify-center py-3.5 px-4 rounded-2xl text-sm font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.05] focus:outline-none focus:ring-2 focus:ring-white/[0.1] transition-all duration-200"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Transcribe another
                </button>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
