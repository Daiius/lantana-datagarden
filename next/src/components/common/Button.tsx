import React from 'react';
import clsx from 'clsx';

const Button: React.FC<
  React.ComponentProps<'button'>
> = ({
  children,
  className,
  ...props
}) => (
  <button
    type='button'
    className={clsx(
      'btn', className
    )}
    {...props}
  >
    {children}
  </button>
);

export default Button;

