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
  const [updateLineCount, setUpdateLineCount] = React.useState<number>(0);

  const { flowWithData, invalidate } = useRealtimeTables({
    projectId, flowId
  });

  // TODO データの追加・削除の度に
  // データの取得し直しをしているので効率が悪い
  const updateLine = async () => {
    setUpdateLineCount(prev => prev + 1);
    await invalidate();
  }
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

  }, [flowWithData, mounted, updateLineCount]);


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
                followingColumnGroups={
                  Array.from(
                    new Map(
                      flowWithData
                        .columnGroups
                        .filter((_, ig) => ig > igroup)
                        .flatMap(group => group.map(g => g))
                        .map(g => [g.id, g])
                    )
                    .entries()
                    .map(([_,v]) => v)
                  )
                }
                updateLine={updateLine}
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

