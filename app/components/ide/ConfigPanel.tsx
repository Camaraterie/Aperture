'use client';

import { useStore, GeminiModel } from '@/app/store/useStore';
import { Settings, X, Cpu, Wrench, Zap } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';

export function ConfigPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    selectedModel, setSelectedModel, 
    modelConfig, setModelConfig,
    apiKey, setApiKey 
  } = useStore();

  const models: { id: GeminiModel; label: string; desc: string }[] = [
    { id: 'gemini-3-flash-preview', label: 'Gemini 3 Flash', desc: 'Fast, low latency, high throughput' },
    { id: 'gemini-3-pro-preview', label: 'Gemini 3 Pro', desc: 'Complex reasoning, coding, STEM' },
    { id: 'gemini-2.5-flash-lite-latest', label: 'Gemini 2.5 Flash Lite', desc: 'Cost effective, lightweight' },
    { id: 'gemini-2.5-flash-image', label: 'Gemini 2.5 Flash Image', desc: 'Multimodal image generation' },
    { id: 'gemini-3-pro-image-preview', label: 'Gemini 3 Pro Image', desc: 'High fidelity image generation' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-white/5 rounded-md transition-colors"
        title="Configuration"
      >
        <Settings className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-80 bg-zinc-950 border-l border-white/10 shadow-2xl z-50 flex flex-col"
            >
              {/* Header */}
              <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 shrink-0">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-indigo-500" />
                  <span className="font-medium text-zinc-100">Configuration</span>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1 text-zinc-500 hover:text-zinc-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-6">
                
                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">API Key</label>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter Gemini API Key..."
                    className="w-full bg-zinc-900 border border-white/10 rounded-md px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 placeholder:text-zinc-700"
                  />
                  <p className="text-[10px] text-zinc-600">
                    Your key is stored locally in your browser.
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Model</label>
                  <div className="space-y-1">
                    {models.map((model) => (
                      <button
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={clsx(
                          "w-full text-left p-2 rounded-md border transition-all",
                          selectedModel === model.id 
                            ? "bg-indigo-500/10 border-indigo-500/50" 
                            : "bg-zinc-900/50 border-transparent hover:bg-zinc-900 hover:border-white/5"
                        )}
                      >
                        <div className={clsx("text-sm font-medium", selectedModel === model.id ? "text-indigo-400" : "text-zinc-300")}>
                          {model.label}
                        </div>
                        <div className="text-[10px] text-zinc-500 mt-0.5">{model.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Parameters */}
                <div className="space-y-4">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Parameters</label>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Temperature</span>
                      <span>{modelConfig.temperature}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={modelConfig.temperature}
                      onChange={(e) => setModelConfig({ temperature: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-zinc-400">
                      <span>Top P</span>
                      <span>{modelConfig.topP}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      value={modelConfig.topP}
                      onChange={(e) => setModelConfig({ topP: parseFloat(e.target.value) })}
                      className="w-full accent-indigo-500 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  
                  {/* Thinking Level (Gemini 3 Only) */}
                  {(selectedModel.includes('gemini-3')) && (
                     <div className="space-y-2 pt-2 border-t border-white/5">
                        <div className="flex items-center gap-2 text-xs text-zinc-400">
                           <Zap className="w-3 h-3 text-amber-500" />
                           <span>Thinking Level</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                           <button
                              onClick={() => setModelConfig({ thinkingLevel: 'LOW' })}
                              className={clsx(
                                 "px-2 py-1.5 rounded text-xs font-medium border transition-colors",
                                 modelConfig.thinkingLevel === 'LOW'
                                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                                    : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                              )}
                           >
                              Low
                           </button>
                           <button
                              onClick={() => setModelConfig({ thinkingLevel: 'HIGH' })}
                              className={clsx(
                                 "px-2 py-1.5 rounded text-xs font-medium border transition-colors",
                                 modelConfig.thinkingLevel === 'HIGH'
                                    ? "bg-amber-500/10 border-amber-500/50 text-amber-500"
                                    : "bg-zinc-900 border-white/5 text-zinc-500 hover:text-zinc-300"
                              )}
                           >
                              High
                           </button>
                        </div>
                     </div>
                  )}
                </div>

                {/* Tools */}
                <div className="space-y-2">
                  <label className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Tools</label>
                  
                  <label className="flex items-center justify-between p-2 rounded-md bg-zinc-900/50 border border-transparent hover:border-white/5 cursor-pointer">
                    <span className="text-sm text-zinc-300">Google Search</span>
                    <input 
                      type="checkbox"
                      checked={modelConfig.tools.googleSearch}
                      onChange={(e) => setModelConfig({ tools: { ...modelConfig.tools, googleSearch: e.target.checked } })}
                      className="accent-indigo-500"
                    />
                  </label>
                  
                  <label className="flex items-center justify-between p-2 rounded-md bg-zinc-900/50 border border-transparent hover:border-white/5 cursor-pointer">
                    <span className="text-sm text-zinc-300">Code Execution</span>
                    <input 
                      type="checkbox"
                      checked={modelConfig.tools.codeExecution}
                      onChange={(e) => setModelConfig({ tools: { ...modelConfig.tools, codeExecution: e.target.checked } })}
                      className="accent-indigo-500"
                    />
                  </label>
                </div>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
