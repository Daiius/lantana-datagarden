'use client'

import React from 'react';
import clsx from 'clsx';

import { useDebouncedCallback } from 'use-debounce';

const Input: React.FC<
  React.ComponentProps<'input'>
   & { onUpdate: (newValue: string) => Promise<void> }
> = ({
  className,
  onUpdate,
  value,
  ...props
}) => {

  const [valuePrivate, setValuePrivate] = React.useState<typeof value>(value);
  const debouncedUpdate = useDebouncedCallback(
    async (newValue: string) => await onUpdate(newValue),
    1_000
  );

  return (
    <input 
      className={clsx(
        className,
      )}
      onChange={async e => {
        setValuePrivate(e.target.value);
        debouncedUpdate(e.target.value);
      }}
      value={valuePrivate}
      {...props}
    />
  )
};

export default Input;

