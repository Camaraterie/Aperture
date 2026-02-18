'use client';

import { motion } from 'motion/react';
import clsx from 'clsx';

interface TokenNode {
  id: string;
  label: string;
  value: number;
  color: string;
  children?: TokenNode[];
}

interface TokenMapProps {
  data: TokenNode[];
  totalTokens: number;
}

export function TokenMap({ data, totalTokens }: TokenMapProps) {
  return (
    <div className="w-full h-full flex flex-col gap-1 p-2">
      {data.map((node) => (
        <TokenBar key={node.id} node={node} total={totalTokens} />
      ))}
    </div>
  );
}

function TokenBar({ node, total }: { node: TokenNode; total: number }) {
  const percentage = Math.max(1, (node.value / total) * 100);
  
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={clsx("w-2 h-2 rounded-full", node.color.replace('bg-', 'bg-').replace('/20', ''))} />
          <span className="text-xs font-medium text-zinc-300">{node.label}</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500">{node.value}t ({percentage.toFixed(1)}%)</span>
      </div>
      
      <div className="relative w-full h-6 bg-zinc-900 rounded overflow-hidden border border-white/5 flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={clsx("h-full opacity-80", node.color)}
        />
        
        {/* Render children as segments if they exist */}
        {node.children && node.children.length > 0 && (
          <div className="absolute inset-0 flex">
            {node.children.map((child) => {
              const childPct = (child.value / node.value) * 100;
              return (
                <div 
                  key={child.id}
                  style={{ width: `${childPct}%` }}
                  className={clsx("h-full border-r border-black/20 first:rounded-l last:rounded-r", child.color)}
                  title={`${child.label}: ${child.value}t`}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
