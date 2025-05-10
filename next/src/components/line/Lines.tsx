'use client' // for hooks

import type { RefObject } from 'react'; 

import { useLines } from '@/providers/LinesProvider';
import Line from '@/components/line/Line';

export type LinesProps = {
  container: RefObject<HTMLDivElement|null>;
}

/**
 * Contextに記録された親子関係を持つデータの一覧から、
 * それらの間に線を引きます
 */
export const Lines = ({
  container
}: LinesProps) => {
  const { relations } = useLines();
  const containerRect = container.current?.getBoundingClientRect();
  if (containerRect == null) return;
  const connections = relations.flatMap(r => {
    const startRect = 
      document.getElementById(`tr-${r.parentId}`)
      ?.getBoundingClientRect();
    const endRects = Array.from(
      document.getElementsByClassName(`tr-${r.id}`)
    ).map(e => e.getBoundingClientRect());
    if (startRect == null || endRects.length === 0) return [];
    return endRects.map(endRect => ({
      start: { 
        x: startRect.right - containerRect.left, 
        y: startRect.top + startRect.height / 2 - containerRect.top, 
      },
      end:   { 
        x: endRect.left - containerRect.left,    
        y: endRect.top + endRect.height / 2 - containerRect.top,
      },
    }));
  });
  return (
    <>
      {connections.map((c,ic) =>
        <Line key={ic} position={c} />
      )}
    </>
  );
}

