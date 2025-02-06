
import React from 'react';
import clsx from 'clsx';

const DebugJson: React.FC<
  React.ComponentProps<'div'>
  & { data: any }
> = ({
  data,
  className,
  ...props
}) => (
  <div 
    className={clsx(
      'bg-sky-200 rounded-lg shadow text-xs',
      'p-4 m-2',
    )}
    {...props}
  >
    <pre>
      {JSON.stringify(data, null, 2)}
    </pre>
  </div>
);

export default DebugJson;

