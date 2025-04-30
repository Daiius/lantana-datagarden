import React from 'react';

import type { 
  Data, Flow
} from '@/types';

export type Point = {
  x: number;
  y: number;
}

export type Connection = {
  start: Point;
  end: Point;
}


export const useLines = ({
  data,
}: {
  data?: Data[];
}): {
  connections: { start: Point; end: Point; }[]
} => {

  if (data == null) return { connections: [] };

  const containerRect = 
    document.getElementById('tables-container')
    ?.getBoundingClientRect();

  if (containerRect == null) return { connections: [] };

  const dataMap = new Map(data.map(d => [d.id, d]));

  const connections = Array.from(dataMap.entries()
    .map(([_, v]) => v)
    .filter(d => d.parentId !== null)
    .flatMap(d => {
      const startRect = 
        document.getElementById(`tr-${d.parentId}`)
        ?.getBoundingClientRect();
      const endRects = Array.from(
        document.getElementsByClassName(`tr-${d.id}`)
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
    }));
  return { connections };
};

