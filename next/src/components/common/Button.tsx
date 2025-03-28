import { 
  ReactNode,
  MouseEventHandler,
} from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  className?: string;
}

const Button = ({
  children,
  onClick,
  className,
}: ButtonProps) => (
  <button
    type='button'
    className={clsx(
      'btn', className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;

