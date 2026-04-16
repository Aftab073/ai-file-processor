import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, useMotionTemplate, useSpring } from 'framer-motion';
import { useDropzone } from 'react-dropzone';
import { FileText, Sparkles, Send, X, ArrowUpCircle } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export default function ChatDocumentCard() {
  const [step, setStep] = useState('idle'); // 'idle' | 'processing' | 'chat'
  const [file, setFile] = useState(null);
  
  // Chat state
  const [question, setQuestion] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [messages, setMessages] = useState([]);
  
  const chatScrollRef = useRef(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (chatScrollRef.current) {
        chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages]);

  // --- SUBTLE 3D MAGNETIC HOVER ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useTransform(mouseY, [-300, 300], [2, -2]); 
  const rotateY = useTransform(mouseX, [-300, 300], [-2, 2]);

  const springX = useSpring(rotateX, { stiffness: 300, damping: 30 });
  const springY = useSpring(rotateY, { stiffness: 300, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    if (step === 'chat') return; // Disable 3D tilt during chat so it's easier to read/type
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

  const glowX = useTransform(mouseX, x => x + 300);
  const glowY = useTransform(mouseY, y => y + 250);
  const background = useMotionTemplate`radial-gradient(500px circle at ${glowX}px ${glowY}px, rgba(99,102,241,0.12), transparent 80%)`;

  // --- DROPZONE ---
  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    if (fileRejections.length > 0) {
      toast.error("Invalid file. Please upload a PDF under 20MB.");
      return;
    }
    if (acceptedFiles.length > 0) {
      setFile(acceptedFiles[0]);
      setStep('processing');
      
      // Simulate "Document AI Scan" visual delay before opening chat interface
      setTimeout(() => {
         setMessages([{ role: 'ai', text: `I've analyzed "${acceptedFiles[0].name}". What would you like to know about it?` }]);
         setStep('chat');
      }, 3500);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: 20 * 1024 * 1024,
    multiple: false
  });

  // --- API LOGIC ---
  const handleAskQuestion = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!question.trim() || !file || isAsking) return;

    const currentQ = question;
    setQuestion("");
    setMessages(prev => [...prev, { role: 'user', text: currentQ }]);
    setIsAsking(true);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('question', currentQ);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/chat/query`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.status === 'success') {
        setMessages(prev => [...prev, { role: 'ai', text: response.data.answer }]);
      }
    } catch (error) {
      console.error("Chat Error:", error);
      toast.error(error.response?.data?.detail || "Failed to get an answer.");
      // Optional: pop the user's message out if it failed, or add an error message
    } finally {
      setIsAsking(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setMessages([]);
    setStep('idle');
  };

  const fadeVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 400, damping: 30 } },
    exit: { opacity: 0, y: -10, scale: 0.98, transition: { duration: 0.15, ease: 'easeOut' } },
  };

  return (
    <motion.div 
      layout
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ 
        rotateX: step === 'chat' ? 0 : springX, 
        rotateY: step === 'chat' ? 0 : springY, 
        transformPerspective: 1000 
      }}
      transition={{ layout: { type: "spring", stiffness: 350, damping: 30 } }}
      className={`group relative w-full mx-auto bg-white/[0.03] backdrop-blur-sm rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-white/[0.08] overflow-hidden transition-all duration-500 hover:shadow-[0_12px_45px_rgb(0,0,0,0.3)] hover:ring-white/[0.12] ${step === 'chat' ? 'max-w-2xl' : 'max-w-xl'}`}
    >
      <motion.div 
         className="pointer-events-none absolute -inset-px rounded-[2rem] transition duration-500 opacity-0 group-hover:opacity-100 z-0" 
         style={{ background }} 
      />

      <motion.div layout className={`relative z-10 ${step === 'chat' ? 'p-0 flex flex-col h-[600px]' : 'p-8 sm:p-10'}`}>
        
        {step !== 'chat' && (
          <div className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl tracking-tight font-bold text-zinc-100 drop-shadow-sm">
              Chat with Document
            </h2>
            <p className="text-sm sm:text-base text-zinc-500 mt-2 font-medium">
              Upload a large PDF and ask instant questions.
            </p>
          </div>
        )}

        <motion.div layout className="relative flex-1 flex flex-col items-center justify-center w-full h-full">
          <AnimatePresence mode="popLayout">
            
            {/* STEP 1: IDLE */}
            {step === 'idle' && (
              <motion.div key="idle" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed rounded-[1.5rem] p-8 sm:p-12 lg:p-16 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group ${isDragActive ? "border-indigo-500/60 bg-indigo-500/10 scale-[1.02]" : "border-white/[0.1] bg-white/[0.02] hover:bg-white/[0.04] hover:border-indigo-500/30"}`}
                >
                  <input {...getInputProps()} />
                  <div className="w-16 h-16 mb-5 bg-white/[0.06] rounded-2xl ring-1 ring-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                    <FileText className={`w-8 h-8 transition-colors duration-300 ${isDragActive ? "text-indigo-400" : "text-zinc-500 group-hover:text-indigo-400"}`} />
                  </div>
                  <p className="text-base font-semibold text-zinc-300 text-center">
                    {isDragActive ? "Drop the PDF here..." : "Drag & drop a manual or contract"}
                  </p>
                  <p className="text-sm text-zinc-600 mt-2 font-medium text-center">PDF standard format only</p>
                </div>
              </motion.div>
            )}

            {/* STEP 2: PROCESSING (The Geometric Document Scanner) */}
            {step === 'processing' && (
              <motion.div key="processing" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="w-full flex flex-col items-center justify-center py-8">
                <div className="w-28 h-28 bg-white/[0.04] shadow-[0_8px_30px_rgb(0,0,0,0.2)] ring-1 ring-white/[0.08] rounded-[2rem] flex items-center justify-center relative overflow-hidden z-10 mb-8">
                   <div className="absolute inset-0 bg-[linear-gradient(rgba(99,102,241,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(99,102,241,0.15)_1px,transparent_1px)] bg-[size:10px_10px] opacity-30" />
                   
                   {[...Array(3)].map((_, i) => (
                      <motion.div 
                        key={i}
                        animate={{ 
                           y: [i * 5 - 10, i * 5 + 10, i * 5 - 10],
                           rotateX: [60, 45, 60],
                           rotateZ: [i * -10, i * 10, i * -10]
                        }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: i * 0.2 }}
                        className={`absolute w-12 h-16 border rounded flex items-start justify-center pt-2 ${i === 0 ? 'border-indigo-400/50 z-30 bg-white/[0.08]' : 'border-white/[0.08] z-10 opacity-40 bg-white/[0.04]'}`}
                      >
                         {i === 0 && <FileText className="w-4 h-4 text-indigo-400" />}
                      </motion.div>
                   ))}
                   
                   <motion.div 
                      animate={{ top: ['-20%', '120%', '-20%'] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.5)] z-40"
                   />
                </div>
                <p className="text-base font-semibold text-zinc-200">Studying Document...</p>
                <p className="mt-1.5 text-sm text-zinc-500 font-medium">Extracting textual architecture.</p>
              </motion.div>
            )}

            {/* STEP 3: CHAT INTERFACE */}
            {step === 'chat' && (
              <motion.div key="chat" variants={fadeVariants} initial="hidden" animate="visible" exit="exit" className="absolute inset-0 w-full flex flex-col bg-[#0A0A1A] rounded-[2rem] overflow-hidden">
                 
                 {/* Top Header */}
                 <div className="flex-none flex items-center justify-between p-4 border-b border-white/[0.06] bg-white/[0.02] z-20">
                    <div className="flex items-center gap-3">
                       <div className="bg-indigo-500/15 p-2 rounded-xl">
                          <FileText className="w-5 h-5 text-indigo-400" />
                       </div>
                       <div className="flex flex-col">
                          <span className="text-sm font-bold text-zinc-200 truncate max-w-[200px] sm:max-w-xs">{file?.name}</span>
                          <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                             <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div> Active Context
                          </span>
                       </div>
                    </div>
                    <button onClick={handleReset} className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all h-fit">
                       <X className="w-5 h-5" />
                    </button>
                 </div>

                 {/* Chat Area */}
                 <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-6 py-6 pb-8 bg-[#0D0D1F] flex flex-col gap-6 custom-scrollbar">
                    {messages.map((msg, idx) => (
                       <motion.div 
                         key={idx} 
                         initial={{ opacity: 0, scale: 0.95, y: 10 }}
                         animate={{ opacity: 1, scale: 1, y: 0 }}
                         className={`flex max-w-[85%] ${msg.role === 'user' ? 'self-end bg-indigo-600 text-white rounded-tl-[1.5rem] rounded-tr-[1.5rem] rounded-bl-[1.5rem] rounded-br-sm' : 'self-start bg-white/[0.05] ring-1 ring-white/[0.08] text-zinc-300 rounded-tl-sm rounded-tr-[1.5rem] rounded-br-[1.5rem] rounded-bl-[1.5rem]'}`}
                       >
                          <div className="px-5 py-3.5 text-sm font-medium leading-relaxed whitespace-pre-wrap">
                             {msg.text}
                          </div>
                       </motion.div>
                    ))}
                    
                    {isAsking && (
                       <div className="self-start bg-white/[0.05] ring-1 ring-white/[0.08] text-zinc-400 rounded-tl-sm rounded-tr-[1.5rem] rounded-br-[1.5rem] rounded-bl-[1.5rem] px-5 py-4 flex items-center gap-2">
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce delay-200"></div>
                       </div>
                    )}
                 </div>

                 {/* Input Bar */}
                 <div className="flex-none p-4 bg-white/[0.02] border-t border-white/[0.06] relative z-20">
                    <form onSubmit={handleAskQuestion} className="relative flex items-center">
                       <div className="absolute left-4 opacity-50"><Sparkles className="w-5 h-5 text-indigo-400" /></div>
                       <input 
                          type="text" 
                          disabled={isAsking}
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder="Ask a question about this file..."
                          className="w-full bg-white/[0.04] ring-1 ring-white/[0.1] hover:bg-white/[0.06] focus:bg-white/[0.06] rounded-full py-4 pl-12 pr-14 text-sm font-medium text-zinc-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all placeholder-zinc-600 disabled:opacity-50"
                       />
                       <button 
                          type="submit" 
                          disabled={isAsking || !question.trim()}
                          className="absolute right-2 bg-indigo-600 hover:bg-indigo-700 text-white p-2.5 rounded-full shadow-md transition-all disabled:opacity-50 disabled:hover:bg-indigo-600 hover:-translate-y-0.5 mt-0.5"
                       >
                          <ArrowUpCircle className="w-6 h-6" />
                       </button>
                    </form>
                 </div>

              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

      </motion.div>
    </motion.div>
  );
}
