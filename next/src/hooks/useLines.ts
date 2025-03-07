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

  const connections = data
    .filter(d => d.parentId !== null)
    .flatMap(d => {
      const startRect = 
        document.getElementById(`tr-${d.parentId}`)
        ?.getBoundingClientRect();
      const endRect =
        document.getElementById(`tr-${d.id}`)
        ?.getBoundingClientRect();
      if (startRect == null || endRect == null) return [];
      return {
        start: { 
          x: startRect.right - containerRect.left, 
          y: startRect.top + startRect.height / 2 - containerRect.top, 
        },
        end:   { 
          x: endRect.left - containerRect.left,    
          y: endRect.top + endRect.height / 2 - containerRect.top,
        },
      };
    });
  return { connections };
};

