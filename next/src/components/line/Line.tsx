'use client'

import React from 'react';
import clsx from 'clsx';

type Point = {
  x: number;
  y: number;
}

const LINE_HOVER_WIDTH = 10 as const;

const calcBounds = (p1: Point, p2: Point ) => {
  return {
    minX: Math.min(p1.x, p2.x),
    minY: Math.min(p1.y, p2.y),
    maxX: Math.max(p1.x, p2.x),
    maxY: Math.max(p1.y, p2.y),
  };
};

const Line: React.FC<
  React.ComponentProps<'svg'>
  & { 
    position: {
      start: { x: number, y: number };
      end  : { x: number, y: number };
    }
  }
> = ({ 
  position,
  className,
  ...props
}) => {
  const {
    minX, minY, maxX, maxY,
  }= calcBounds(position.start, position.end);
  const width = Math.max(maxX - minX, 2);
  const height = Math.max(maxY - minY, 2) + LINE_HOVER_WIDTH / 2;
  const left = minX;
  const top  = minY - LINE_HOVER_WIDTH / 2; 
  const start = {
    x: position.start.x - minX,
    y: position.start.y - minY + LINE_HOVER_WIDTH / 2,
  };
  const end = {
    x: position.end.x - minX,
    y: position.end.y - minY + LINE_HOVER_WIDTH/ 2,
  };
  // 真横を向いた線の時には線の半分がviewboxから出てしまうことを防ぐ
  //if (start.y === 0 && end.y === 0) {
  //  start.y = 1;
  //  end.y = 1;
  //}
  return (
    <svg
      className={clsx(
        className,
        'absolute',
        'stroke-white/50 pointer-events-none',
      )}
      viewBox={`0 0 ${width} ${height}`}
      style={{ left, top, width, height }}
      stroke='currentColor'
      {...props}
    >
      {/* 当たり判定用の太めのline */}
      <line
        className='peer pointer-events-auto'
        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
        strokeWidth={LINE_HOVER_WIDTH}
        stroke='transparent'
      />
      {/* 表示するline */}
      <line 
        className='peer-hover:stroke-white'
        x1={start.x} y1={start.y} x2={end.x} y2={end.y}
      />
    </svg>
  );
};

export default Line;
