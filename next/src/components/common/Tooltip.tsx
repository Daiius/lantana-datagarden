import React from 'react';
import clsx from 'clsx';

const Tooltip: React.FC<
  React.ComponentProps<'div'>
  & { 
    tip: string;
    direction?: 'top' | 'right' | 'bottom' | 'left';
  }
> = ({
  tip,
  direction = 'top',
  className,
  children,
  ...props
}) => (
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
    {...props}
  >
    {children}
  </div>
);

export default Tooltip;

