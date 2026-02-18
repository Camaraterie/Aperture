'use client';

import { useState, useRef, useEffect } from 'react';
import { HistoryPanel } from './HistoryPanel';
import { PromptEditor } from './PromptEditor';
import { ContextPanel } from './ContextPanel';
import clsx from 'clsx';

export function IDE_Layout() {
  const [leftWidth, setLeftWidth] = useState(20); // Percentage
  const [rightWidth, setRightWidth] = useState(30); // Percentage
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingLeft = useRef(false);
  const isDraggingRight = useRef(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const containerWidth = containerRect.width;
      const x = e.clientX - containerRect.left;
      
      if (isDraggingLeft.current) {
        const newLeftWidth = (x / containerWidth) * 100;
        if (newLeftWidth > 15 && newLeftWidth < 40) {
          setLeftWidth(newLeftWidth);
        }
      } else if (isDraggingRight.current) {
        const newRightWidth = ((containerWidth - x) / containerWidth) * 100;
        if (newRightWidth > 20 && newRightWidth < 50) {
          setRightWidth(newRightWidth);
        }
      }
    };

    const handleMouseUp = () => {
      isDraggingLeft.current = false;
      isDraggingRight.current = false;
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startDraggingLeft = () => {
    isDraggingLeft.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  const startDraggingRight = () => {
    isDraggingRight.current = true;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  return (
    <div className="h-screen w-screen bg-zinc-950 text-zinc-50 overflow-hidden flex flex-col">
      {/* Top Navigation / Branding */}
      <header className="h-10 border-b border-white/5 flex items-center px-4 bg-zinc-950 shrink-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-indigo-500 rounded-sm" />
          <span className="text-sm font-semibold tracking-tight text-zinc-200">Prompt IDE</span>
          <span className="text-[10px] bg-zinc-900 text-zinc-500 px-1.5 py-0.5 rounded border border-white/5 ml-2">v0.1.0</span>
        </div>
      </header>

      {/* Main Workspace */}
      <div className="flex-1 overflow-hidden flex" ref={containerRef}>
        
        {/* Left Pane: History */}
        <div style={{ width: `${leftWidth}%` }} className="h-full bg-zinc-950 shrink-0">
          <HistoryPanel />
        </div>
        
        {/* Left Resizer */}
        <div 
          className="w-[1px] bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize relative z-10 flex items-center justify-center group"
          onMouseDown={startDraggingLeft}
        >
          <div className="w-1 h-full absolute -left-0.5 group-hover:bg-indigo-500/10" />
        </div>
        
        {/* Center Pane: Editor */}
        <div className="flex-1 h-full min-w-0">
          <PromptEditor />
        </div>
        
        {/* Right Resizer */}
        <div 
          className="w-[1px] bg-white/5 hover:bg-indigo-500/50 transition-colors cursor-col-resize relative z-10 flex items-center justify-center group"
          onMouseDown={startDraggingRight}
        >
          <div className="w-1 h-full absolute -left-0.5 group-hover:bg-indigo-500/10" />
        </div>
        
        {/* Right Pane: Context X-Ray */}
        <div style={{ width: `${rightWidth}%` }} className="h-full bg-zinc-950 shrink-0">
          <ContextPanel />
        </div>
        
      </div>
    </div>
  );
}
