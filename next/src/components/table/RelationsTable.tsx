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

  const { 
    data: columnGroups, 
    isLoading: isLoadingColumnGroups 
  } = trpc.columnGroups.list.useQuery({ projectId: zeroId });

  const columns = columnGroups?.[0]
    ?.innerColumns.flatMap(ic => ic.columns);

  const { data } = trpc.data.list.useQuery(
    { projectId: zeroId, columnGroupId: columnGroups?.[0]?.id ?? "" }
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
        <RelationsRow data={data} />
      }
    </div>
  );
};

export default RelationsTable;

