import React from 'react';
import clsx from 'clsx';

type Point = {
  x: number;
  y: number;
}

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
  const height = Math.max(maxY - minY, 2);
  const start = {
    x: position.start.x - minX,
    y: position.start.y - minY,
  };
  const end = {
    x: position.end.x - minX,
    y: position.end.y - minY,
  };
  return (
    <svg
      className={clsx(
        className,
        'absolute',
        'stroke-white pointer-events-none',
      )}
      viewBox={`0 0 ${width} ${height}`}
      style={{ 
        left: minX, 
        top: minY, 
        width, height,
      }}
      stroke='currentColor'
      {...props}
    >
      <line x1={start.x} y1={start.y} x2={end.x} y2={end.y}/>
    </svg>
  );
};

export default Line;
