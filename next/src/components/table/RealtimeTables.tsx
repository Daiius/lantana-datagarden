'use client'

import React from 'react';
import clsx from 'clsx';

import type { Flow } from '@/types';

import { useRealtimeFlow } from '@/hooks/useRealtimeFlow';

import RealtimeTable from '@/components/table/RealtimeTable';

const RealtimeTables: React.FC<
  React.ComponentProps<'div'>
  & {
    projectId: string;
    flowId: Flow['id'];
  }
> = ({
  projectId,
  flowId,
  className,
  ...props
}) => {
  const { flow, error } = useRealtimeFlow({ projectId, id: flowId });

  if (error != null) return (
    <div className='bg-error rounded-md'>
      {error.message}
    </div>
  );

  if (flow == null) return (
    <div className='skeleton h-32 w-full'/>
  );

  return (
    <div
      className={clsx(
        'flex flex-row gap-8',
        className,
      )}
      {...props}
    >
      {flow.columnGroups?.map((group, igroup) =>
        <div key={igroup} className='flex flex-col gap-8'>
          {group.map((cg, icg) =>
            <div key={`${cg.id}-${icg}`}>
              <div className='font-bold text-lg'>
                {cg.name}
              </div>
              <RealtimeTable 
                projectId={cg.projectId}
                columnGroupId={cg.id}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RealtimeTables;

