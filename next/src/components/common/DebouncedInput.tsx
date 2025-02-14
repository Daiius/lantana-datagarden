'use client'

import React from 'react';
import clsx from 'clsx';

import { useDebouncedCallback } from 'use-debounce';

/**
 * debouncedOnChangeを提供するinputです
 */
const DebouncedInput: React.FC<
  React.ComponentProps<'input'>
  & { 
    debouncedOnChange: (newValue: string) => Promise<void>,
    wait?: number,
  }
> = ({
  className,
  debouncedOnChange,
  wait = 1_000,
  value,
  ...props
}) => {

  const [valuePrivate, setValuePrivate] = 
    React.useState<typeof value>(value);
  const debouncedUpdate = useDebouncedCallback(
    async (newValue: string) => await debouncedOnChange(newValue),
    wait,
  );
  // 外部から変更が有った際は強制的に反映
  React.useEffect(() => {
    if (value !== valuePrivate) {
      setValuePrivate(value);
    }
  }, [value]);

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

export default DebouncedInput;

