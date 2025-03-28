'use client'

import React from 'react';
import clsx from 'clsx';

import { useDebouncedCallback } from 'use-debounce';

import { validate } from '@/types';
import type { Column } from '@/types';

type DebouncedInputProps = {
  debouncedOnChange: (newValue: string | number) => Promise<void>,
  wait?: number,
  validation?: Column['type'],

  className?: string;
  value: string | number | readonly string[] | undefined;
}

/**
 * debouncedOnChangeを提供するinputです
 */
const DebouncedInput = ({
  className,
  debouncedOnChange,
  wait = 1_000,
  validation,
  value,
}: DebouncedInputProps) => {

  const [valuePrivate, setValuePrivate] = 
    React.useState<typeof value>(value);
  const [valid, setValid] =
    React.useState<boolean>(true);
  const debouncedUpdate = useDebouncedCallback(
    async (newValue: string | number) => { 
      if (validation != null && !valid) {
        return;
      }
      await debouncedOnChange(newValue);
    },
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
        'input',
        !valid && 'input-error',
        (validation === 'string' || validation == null) 
          ? 'text-left' 
          : 'text-right',
        className,
      )}
      onChange={async e => {
        setValuePrivate(e.target.value);
        if (validation) {
          setValid(
            validate({ type: validation, v: e.target.value })
          );
        }
        await debouncedUpdate(e.target.value);
      }}
      value={valuePrivate}
    />
  )
};

export default DebouncedInput;

