import React from 'react';
import clsx from 'clsx';

const Skeleton: React.FC<
  React.ComponentProps<'div'>
> = ({
  className,
  ...props
}) => (
  <div
    className={clsx(
      'bg-slate-500/50 rounded-md',
      className,
    )}
    {...props}
  >
  </div>
);

export default Skeleton;

