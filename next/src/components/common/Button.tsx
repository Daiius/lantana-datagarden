import { 
  ReactNode,
  MouseEventHandler,
} from 'react';
import clsx from 'clsx';

type ButtonProps = {
  children: ReactNode;
  onClick?: MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  className?: string;
}

const Button = ({
  children,
  onClick,
  disabled = false,
  className,
}: ButtonProps) => (
  <button
    type='button'
    disabled={disabled}
    className={clsx(
      'btn', 
      disabled && 'btn-disabled',
      className
    )}
    onClick={onClick}
  >
    {children}
  </button>
);

export default Button;

