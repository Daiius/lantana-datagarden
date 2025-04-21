import clsx from 'clsx';

import { validate } from '@/types';
import type { Column } from '@/types';

export type InputProps = {
  value: string | number | undefined | null;
  onChange: (newValue: string | number) => Promise<void>;

  validation?: Column['type'];
  isOptional?: Column['isOptional'];

  className?: string;
}

const Input = ({
  value,
  validation,
  onChange,
  isOptional,
  className,
}: InputProps) => {
  const valid = validation == null
    ? true
    : validate({
      type: validation, isOptional, v: value ?? null,
    }); 
  return (
    <input 
      className={clsx(
        'input',
        !valid && 'input-error',
        (validation === 'string' || validation == null) 
          ? 'text-left' 
          : 'text-right',
        className,
      )}
      value={value ?? ''}
      onChange={async e => await onChange(e.target.value)}
    />
  );
};

export default Input;

