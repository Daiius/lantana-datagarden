import clsx from 'clsx';
import { ReactNode } from 'react';

type Value = string | number | readonly string[] | undefined;

export type SelectProps = {
  value: Value;
  onChange: (newValue: Value) => void;
  defaultValue?: Value;
  children?: ReactNode;
  className?: string;
};

export const Select = ({
  value,
  children,
  defaultValue,
  onChange,
  className,
}: SelectProps) => (
  <select
    className={clsx(
      'select',
      className,
    )}
    value={value}
    onChange={e => onChange(e.target.value)}
    defaultValue={defaultValue}
  >
    {children}
  </select>
);

