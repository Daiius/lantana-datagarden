import React from 'react';
import clsx from 'clsx';

type TooltipProps = {
  tip: string;
  direction?: 'top' | 'right' | 'bottom' | 'left';
  
  className?: string;
  children: React.ReactNode;
};

const Tooltip = ({
  tip,
  direction = 'top',
  className,
  children,
}: TooltipProps) => (
  <div 
    className={clsx(
      'tooltip',
        direction === 'right'  ? 'tooltip-right'
      : direction === 'bottom' ? 'tooltip-bottom'
      : direction === 'left'   ? 'tooltip-left'
      : undefined,
      className,
    )}
    data-tip={tip}
  >
    {children}
  </div>
);

export default Tooltip;

