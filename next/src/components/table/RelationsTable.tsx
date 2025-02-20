'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import Tooltip from '@/components/common/Tooltip';
import RelationsRow from '@/components/table/RelationsRow';
  
const zeroId = '00000000-0000-0000-0000-000000000000' as const;

const RelationsTable: React.FC<
  React.ComponentProps<'div'>
> = ({
  className,
  ...props
}) => {

  const { data, isLoading } = trpc.table.get.useQuery({ 
    projectId: zeroId,
  });

  if (data == null) return <div>Loading...</div>;

  const { columns } = data;

  const orderMap = new Map(
    columns.map((c, icolumn) => [c.name, icolumn])
  );

  return (
    <div 
      className={clsx(
        'm-4 overflow-auto',
        className,
      )}
    >
      <div 
        className={clsx(
          'flex flex-row',
          'sticky top-0 z-10'
        )}>
        {columns?.map(c =>
          <input 
            key={c.id} 
            className={clsx(
              'input input-ghost input-sm',
              'rounded-none text-center',
              'bg-info w-32 border border-white/50',
            )}
            defaultValue={c.name}
          />
        )}
        <Tooltip tip='add column' direction='right'>
          <button 
            className={clsx(
              'btn btn-sm btn-success',
              'w-full',
            )}
          >
            +
          </button>
        </Tooltip>
      </div>
      {data && 
        <RelationsRow 
          data={data.data} 
          columns={columns}
          orderMap={orderMap}
        />
      }
    </div>
  );
};

export default RelationsTable;

