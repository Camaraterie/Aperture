'use client';

import { useStore, ContextViewMode } from '@/app/store/useStore';
import { Layers, Code, BarChart3, Database, MessageSquare, Cpu } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import clsx from 'clsx';
import { TokenMap } from './TokenMap';

export function ContextPanel() {
  const { contextViewMode, setContextViewMode, systemPrompt, currentOutput, currentUsage } = useStore();

  // Calculate approximate tokens (rough estimate: 4 chars = 1 token)
  const systemTokens = Math.ceil(systemPrompt.length / 4);
  const outputTokens = Math.ceil(currentOutput.length / 4);
  // In a real app, we'd use a tokenizer or the usage metadata from the API
  
  const totalTokens = currentUsage?.total || (systemTokens + outputTokens);
  const tokenLimit = 1000000; // Gemini 1.5 Pro limit example

  return (
    <div className="h-full flex flex-col bg-zinc-900/30 border-l border-white/5">
      {/* Header */}
      <div className="h-12 border-b border-white/5 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Context X-Ray</span>
        </div>
        
        {/* View Toggles */}
        <div className="flex items-center bg-zinc-900 rounded-lg p-0.5 border border-white/5">
          <ViewToggle 
            active={contextViewMode === 'stack'} 
            onClick={() => setContextViewMode('stack')} 
            icon={Layers} 
            label="Stack" 
          />
          <ViewToggle 
            active={contextViewMode === 'token_map'} 
            onClick={() => setContextViewMode('token_map')} 
            icon={BarChart3} 
            label="Map" 
          />
          <ViewToggle 
            active={contextViewMode === 'json'} 
            onClick={() => setContextViewMode('json')} 
            icon={Code} 
            label="JSON" 
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <AnimatePresence mode="wait">
          {contextViewMode === 'stack' && (
             <StackView 
               systemTokens={systemTokens} 
               systemContent={systemPrompt}
               outputTokens={outputTokens}
               outputContent={currentOutput}
             />
          )}
          {contextViewMode === 'token_map' && (
             <TokenMapView 
               systemTokens={systemTokens} 
               outputTokens={outputTokens}
               totalTokens={totalTokens}
             />
          )}
          {contextViewMode === 'json' && (
             <JsonView data={{ systemPrompt, currentOutput, usage: currentUsage }} />
          )}
        </AnimatePresence>
      </div>

      {/* Token Meter Footer */}
      <div className="p-4 border-t border-white/5 bg-zinc-900/20 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Token Usage</span>
          <span className="text-xs font-mono text-zinc-300">
            {totalTokens.toLocaleString()} <span className="text-zinc-600">/</span> {tokenLimit.toLocaleString()}
          </span>
        </div>
        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-500 rounded-full transition-all duration-500" 
            style={{ width: `${Math.min(100, (totalTokens / tokenLimit) * 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

function ViewToggle({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        "p-1.5 rounded-md transition-all",
        active ? "bg-zinc-700 text-zinc-100 shadow-sm" : "text-zinc-500 hover:text-zinc-300"
      )}
      title={label}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}

function StackView({ systemTokens, systemContent, outputTokens, outputContent }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -10 }}
      className="space-y-3"
    >
      <ContextCard title="System Prompt" icon={Cpu} tokens={systemTokens} color="border-indigo-500/50">
        {systemContent || <span className="italic opacity-50">Empty</span>}
      </ContextCard>
      
      <ContextCard title="Model Output" icon={MessageSquare} tokens={outputTokens} color="border-emerald-500/50">
        {outputContent || <span className="italic opacity-50">No output yet</span>}
      </ContextCard>
    </motion.div>
  );
}

function ContextCard({ title, icon: Icon, tokens, children, color }: any) {
  return (
    <div className={clsx("bg-zinc-900/50 border-l-2 rounded-r-lg p-3", color)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon className="w-3.5 h-3.5 text-zinc-400" />
          <span className="text-xs font-medium text-zinc-300">{title}</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-white/5">
          {tokens}t
        </span>
      </div>
      <div className="text-xs text-zinc-400 font-mono leading-relaxed opacity-80 line-clamp-3 whitespace-pre-wrap">
        {children}
      </div>
    </div>
  );
}

function TokenMapView({ systemTokens, outputTokens, totalTokens }: any) {
   const data = [
      {
         id: 'system',
         label: 'System Prompt',
         value: systemTokens,
         color: 'bg-indigo-500',
         children: [
            { id: 'sys-core', label: 'Core Instructions', value: Math.floor(systemTokens * 0.8), color: 'bg-indigo-400' },
            { id: 'sys-safety', label: 'Safety', value: Math.ceil(systemTokens * 0.2), color: 'bg-indigo-600' }
         ]
      },
      {
         id: 'output',
         label: 'Model Output',
         value: outputTokens,
         color: 'bg-emerald-500',
         children: []
      }
   ];

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <TokenMap data={data} totalTokens={totalTokens || 1} />
    </motion.div>
  );
}

function JsonView({ data }: { data: any }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <pre className="text-[10px] font-mono text-zinc-400 bg-zinc-950 p-3 rounded-lg border border-white/5 overflow-auto h-full">
        {JSON.stringify(data, null, 2)}
      </pre>
    </motion.div>
  );
}
