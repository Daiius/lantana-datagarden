'use client'

import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';

import RealtimeTable from '@/components/table/RealtimeTable';

const RealtimeTables: React.FC<
  React.ComponentProps<'div'>
  & {
    projectId: string;
  }
> = ({
  projectId,
  className,
  ...props
}) => {
  const { data: columnGroups } = trpc.columnGroup.list.useQuery(
    { projectId }
  );

  return (
    <div
      className={clsx(
        'flex flex-row gap-8',
        className,
      )}
      {...props}
    >
      {columnGroups?.map(cg =>
        <div key={cg.id}>
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
  );
};

export default RealtimeTables;

