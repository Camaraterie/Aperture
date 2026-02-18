'use client';

import { useStore } from '@/app/store/useStore';
import { format } from 'date-fns';
import { History, GitCommit, ChevronRight } from 'lucide-react';

export function HistoryPanel() {
  const { promptVersions, loadVersion } = useStore();

  return (
    <div className="h-full flex flex-col bg-zinc-900/30 border-r border-white/5">
      <div className="p-4 border-b border-white/5 flex items-center gap-2">
        <History className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Version History</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {promptVersions.length === 0 ? (
          <div className="p-4 text-center text-zinc-600 text-xs italic">
            No versions saved yet.
          </div>
        ) : (
          promptVersions.map((version) => (
            <button
              key={version.id}
              onClick={() => loadVersion(version.id)}
              className="w-full flex items-start gap-3 p-3 rounded-lg hover:bg-white/5 transition-colors group text-left"
            >
              <GitCommit className="w-4 h-4 text-zinc-500 mt-0.5 group-hover:text-indigo-400 transition-colors" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-zinc-300 truncate">{version.label}</span>
                </div>
                <div className="text-[10px] text-zinc-600 font-mono mt-1">
                  {format(version.timestamp, 'MMM d, HH:mm')}
                </div>
                <div className="text-xs text-zinc-500 mt-2 line-clamp-2 font-mono opacity-60">
                  {version.systemPrompt}
                </div>
              </div>
              <ChevronRight className="w-3 h-3 text-zinc-700 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          ))
        )}
      </div>
    </div>
  );
}
