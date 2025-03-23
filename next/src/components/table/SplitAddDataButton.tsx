'use client'

import React from 'react';
import clsx from 'clsx';


import type { Column } from '@/types';

import { trpc } from '@/providers/TrpcProvider';

const Button: React.FC<
  React.ComponentProps<'button'>
> = ({
  className,
  children,
  ...props
}) => (
  <button 
    className={clsx(
      'btn btn-success btn-sm !font-bold !text-2xl',
      className,
    )}
    {...props}
  >
    {children}
  </button>
);

const ShrinkedSplitAddDataButton: React.FC<
  React.ComponentProps<'div'>
  & {
    columns: Column[],
    setExpanded: (expand: boolean) => void;
  }
> = ({
  columns,
  setExpanded,
  className,
  ...props
}) => {
  const projectId = columns[0]?.projectId ?? '';
  const columnGroupId = columns[0]?.columnGroupId ?? 0;

  const { mutateAsync } = trpc.data.add.useMutation();
  const utils = trpc.useUtils();

  return (
    <div 
      className={clsx('flex flex-row join', className)}
      {...props}
    >
      {/* 1対多データ追加モードへ */}
      <Button 
        className='join-item w-[20%]'
        onClick={() => setExpanded(true)}
      >
        ...
      </Button>
      {/* 1対1データ追加 */}
      <Button 
        className='join-item w-[80%]'
        onClick={async () => {
          const newData = Object.fromEntries(
            columns.map(c => [c.name, ''])
          );
          const { id: newId } = await mutateAsync({
            projectId, columnGroupId,
            parentId: null,
            data: newData,
          });
          utils.data.list.setData(
            { projectId, columnGroupId, },
            prevData => {
              const firstData = prevData?.[0];
              if (firstData == null) return [];
              if (prevData == null) return [];
              return [
                ...prevData, 
                { ...firstData, data: newData, id: newId },
              ]
            }
          );
        }}
      >
        +
      </Button>
    </div>
  );
};

const ExpandedSplitAddDataButton: React.FC<
  React.ComponentProps<'div'>
  & { 
    columns: Column[];
    setExpanded: (expand: boolean) => void;
  }
> = ({
  columns,
  setExpanded,
  className,
  ...props
}) => (
  <div 
    className={clsx('flex flex-row join', className)}
    {...props}
  >
    {columns.map((c, ic) =>
      ic === 0
      ? <Button 
          key={c.id}
          className='bg-success/80 w-32 join-item'
          onClick={() => setExpanded(false)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="icon icon-tabler icons-tabler-outline icon-tabler-arrow-back-up"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
            <path d="M9 14l-4 -4l4 -4" />
            <path d="M5 10h11a4 4 0 1 1 0 8h-1" />
          </svg>
        </Button>
      : <Button
          key={c.id}
          className='w-32 join-item'
        >
          +
        </Button>
    )}
  </div>
);

const SplitAddDataButton: React.FC<
  React.ComponentProps<'div'>
  & { columns: Column[] }
> = ({ ...props }) => {
  const [expanded, setExpanded] = React.useState<boolean>(false);
  return (
    expanded
    ? <ExpandedSplitAddDataButton 
        setExpanded={setExpanded}
        {...props}
      />
    : <ShrinkedSplitAddDataButton
        setExpanded={setExpanded}
        {...props}
      />
  );
};

export default SplitAddDataButton;

