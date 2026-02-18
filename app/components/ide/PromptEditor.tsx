'use client';

import { useStore } from '@/app/store/useStore';
import { Save, Play, Sparkles, Loader2, BrainCircuit, ChevronDown, ChevronRight } from 'lucide-react';
import { ConfigPanel } from './ConfigPanel';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

export function PromptEditor() {
  const { 
    systemPrompt, setSystemPrompt, savePromptVersion,
    apiKey, selectedModel, modelConfig,
    isGenerating, setIsGenerating,
    currentOutput, setCurrentOutput,
    currentReasoning, setCurrentReasoning,
    setCurrentUsage, addToHistory
  } = useStore();

  const [isReasoningExpanded, setIsReasoningExpanded] = useState(false);

  const handleRun = async () => {
    if (!apiKey) {
      alert('Please enter your Gemini API Key in the configuration panel.');
      return;
    }

    setIsGenerating(true);
    setCurrentOutput('');
    setCurrentReasoning('');
    setCurrentUsage(null);

    try {
      const ai = new GoogleGenAI({ apiKey });
      
      // Prepare config
      const config: any = {
        temperature: modelConfig.temperature,
        topP: modelConfig.topP,
        topK: modelConfig.topK,
      };

      // Add thinking config if applicable
      if (selectedModel.includes('gemini-3') && modelConfig.thinkingLevel) {
        config.thinkingConfig = {
           thinkingLevel: modelConfig.thinkingLevel === 'HIGH' ? ThinkingLevel.HIGH : ThinkingLevel.LOW
        };
      }

      // Add tools
      const tools: any[] = [];
      if (modelConfig.tools.googleSearch) tools.push({ googleSearch: {} });
      if (modelConfig.tools.codeExecution) tools.push({ codeExecution: {} });
      if (tools.length > 0) config.tools = tools;

      // Call API
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: [
          { role: 'user', parts: [{ text: systemPrompt }] } // Treating system prompt as user prompt for simple testing, or we can use systemInstruction if we had a separate user input field.
          // For this MVP, let's assume the "System Prompt" editor IS the prompt we want to test.
        ],
        config
      });

      const text = response.text;
      
      // Extract reasoning if available (Gemini 3 usually returns it in a specific way, 
      // but for now we'll check if there are parts that are "thought" or similar, 
      // or just standard text. The SDK simplifies this usually).
      // Note: The current SDK might not separate reasoning easily in the .text property 
      // without specific handling if it's a "thought" part.
      // For MVP, we will just display the text. 
      // If the model returns <thought> tags (common in some previews), we could parse it.
      
      setCurrentOutput(text || 'No output generated.');
      
      // Mock usage for now as the SDK response might vary in structure for usage metadata
      const usage = response.usageMetadata;
      if (usage) {
         setCurrentUsage({
            prompt: usage.promptTokenCount || 0,
            response: usage.candidatesTokenCount || 0,
            total: usage.totalTokenCount || 0
         });
      }

      // Add to history
      addToHistory({
        systemPrompt,
        model: selectedModel,
        output: text,
        tokenUsage: usage ? {
            prompt: usage.promptTokenCount || 0,
            response: usage.candidatesTokenCount || 0,
            total: usage.totalTokenCount || 0
        } : undefined
      });

    } catch (error: any) {
      console.error('Generation error:', error);
      setCurrentOutput(`Error: ${error.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Toolbar */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 bg-zinc-900/20 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">System Prompt</span>
        </div>
        <div className="flex items-center gap-2">
          <ConfigPanel />
          <button 
            onClick={() => savePromptVersion()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-400 hover:text-zinc-100 hover:bg-white/5 transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
          <button 
            onClick={handleRun}
            disabled={isGenerating}
            className={clsx(
              "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-all shadow-sm",
              isGenerating 
                ? "bg-zinc-800 text-zinc-500 cursor-not-allowed" 
                : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20"
            )}
          >
            {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            {isGenerating ? 'Running...' : 'Run'}
          </button>
        </div>
      </div>

      {/* Editor Area */}
      <div className="flex-1 relative min-h-0">
        <textarea
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
          className="w-full h-full bg-transparent p-6 resize-none focus:outline-none font-mono text-sm text-zinc-300 leading-relaxed placeholder:text-zinc-700"
          placeholder="Enter your prompt here..."
          spellCheck={false}
        />
        
        {/* Floating Action / Status */}
        <div className="absolute bottom-4 right-4 flex items-center gap-2 pointer-events-none">
          <div className="px-2 py-1 rounded bg-zinc-900/80 border border-white/5 text-[10px] text-zinc-500 font-mono backdrop-blur-sm">
            {systemPrompt.length} chars
          </div>
        </div>
      </div>

      {/* Output Area */}
      <div className="h-1/2 border-t border-white/5 bg-zinc-900/10 flex flex-col min-h-0">
        <div className="px-4 py-2 border-b border-white/5 flex items-center justify-between shrink-0 bg-zinc-900/30">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Output</span>
          </div>
          {currentReasoning && (
             <button 
               onClick={() => setIsReasoningExpanded(!isReasoningExpanded)}
               className="flex items-center gap-1.5 text-[10px] text-amber-500 hover:text-amber-400 transition-colors"
             >
               <BrainCircuit className="w-3 h-3" />
               {isReasoningExpanded ? 'Hide Reasoning' : 'Show Reasoning'}
             </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-0">
           {/* Reasoning Accordion */}
           <AnimatePresence>
              {currentReasoning && isReasoningExpanded && (
                 <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-b border-amber-500/20 bg-amber-950/10 overflow-hidden"
                 >
                    <div className="p-4 text-xs font-mono text-amber-200/80 italic leading-relaxed whitespace-pre-wrap border-l-2 border-amber-500/50 ml-4 my-2 pl-4">
                       {currentReasoning}
                    </div>
                 </motion.div>
              )}
           </AnimatePresence>

           {/* Main Output */}
           <div className="p-6">
              {currentOutput ? (
                 <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-zinc-900 prose-pre:border prose-pre:border-white/5">
                    <ReactMarkdown>{currentOutput}</ReactMarkdown>
                 </div>
              ) : (
                 <div className="flex items-center justify-center h-20 text-zinc-700 text-sm font-mono italic">
                    {isGenerating ? 'Generating response...' : 'Run the prompt to see output...'}
                 </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
