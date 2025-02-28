'use client'

import React from 'react';
import clsx from 'clsx';

import { useDebouncedCallback } from 'use-debounce';


type DebouncedSelectOptions<T extends readonly string[],> = 
  React.ComponentProps<'select'>
  & {
    debouncedOnChange: (newValue: T[number]) => Promise<void>,
    options: T,
    wait?: number,
  };

const DebouncedSelect = <T extends readonly string[],>({
  value, // 注. headless Select にはやっぱり value がない
  debouncedOnChange,
  options,
  wait = 1_000,
  className,
  ...props
}: DebouncedSelectOptions<T>) => {
  const [valuePrivate, setValuePrivate] =
    React.useState<typeof value>(value);
  const stableValueRef = React.useRef<typeof value>(value);
  const debouncedUpdate = useDebouncedCallback(
    async (newValue: T[number]) => {
      try {
        await debouncedOnChange(newValue);
        stableValueRef.current = newValue;
      } catch (err) {
        setValuePrivate(stableValueRef.current);
      }
    },
    wait,
  );
  React.useEffect(() => {
    if (value != valuePrivate) {
      console.log('useEffect, value: %o', value);
      console.log('useEffect, valuePrivate: %o', valuePrivate);
      setValuePrivate(value);
    }
  }, [value]);

  console.log('valuePrivate: ', valuePrivate);

  return (
    <select
      className={clsx(
        'select',
        className,
      )}
      value={valuePrivate}
      onChange={async e => {
        await debouncedUpdate(e.currentTarget?.value);
        setValuePrivate(e.currentTarget?.value);
      }}
      {...props}
    >
      {options.map(o =>
        <option key={o} value={o}>{o}</option>
      )}
    </select>
  );
};

export default DebouncedSelect;

