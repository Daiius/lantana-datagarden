'use client'

import React from 'react';
import clsx from 'clsx';

import type { Flow } from '@/types';

import { useRealtimeTables } from '@/hooks/useRealtimeTables';
import { useLines, Connection } from '@/hooks/useLines';

import RealtimeTable from '@/components/table/RealtimeTable';

import Line from '@/components/line/Line';

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

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [connections, setConnections] = React.useState<Connection[]>([]);

  const { flowWithData } = useRealtimeTables({
    projectId, flowId
  });
  const allData = flowWithData
    ?.columnGroups
    .flatMap(cgs => cgs.flatMap(cg => cg.data)) ?? [];

  React.useEffect(() => {
    if (!mounted) {
      setMounted(true);
      console.log('first rendering...');
      return;
    }

    console.log('second rendering...');

    setTimeout(() => {
      const { connections } = useLines({ data: allData, });
      setConnections(connections);
      console.log('allData: ', allData);
      console.log('connections: ', connections);
    }, 1_000);

  }, [flowWithData, mounted]);


  if (flowWithData == null) return (
    <div className='skeleton h-32 w-full'/>
  );

  return (
    <div
      id='tables-container'
      className={clsx(
        'flex flex-row gap-8',
        'relative',
        className,
      )}
      {...props}
    >
      {flowWithData.columnGroups?.map((group, igroup) =>
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
      {connections.map((c,ic) =>
        <Line key={ic} position={c} />
      )}
    </div>
  );
};

export default RealtimeTables;

