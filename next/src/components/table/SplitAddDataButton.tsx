'use client'

import React from 'react';
import clsx from 'clsx';

const SplitAddDataButton: React.FC<
  React.ComponentProps<'div'>
  & { columns: string[] }
> = ({
  columns,
  className,
  ...props
}) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  if (expanded) {
    return (
      <div className='flex flex-row join'>
        {columns.map((c, ic) =>
          ic === 0
          ? <button 
              key={c}
              className='btn btn-primary btn-sm w-32 join-item'
              onClick={() => setExpanded(false)}
            >
              (back)
            </button>
          : <button
              key={c}
              className='btn btn-success btn-sm w-32 join-item'
            >
              +
            </button>
        )}
      </div>
    );
  } else {
    return (
      <div className='flex flex-row join'>
        <button className='btn btn-success btn-sm join-item w-[80%]'>
          +
        </button>
        <button 
          className='btn btn-success btn-sm join-item w-[20%]'
          onClick={() => setExpanded(true)}
        >
          ...
        </button>
      </div>
    );
  }
};

export default SplitAddDataButton;

