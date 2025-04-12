'use client'

import React from 'react';
import clsx from 'clsx';

import type { 
  Flow,
  FlowWithData,
  FlowStep as FlowStepType
} from '@/types';

import { useTables } from '@/hooks/useTables';
import { useLines, Connection } from '@/hooks/useLines';

import FlowStep from '@/components/table/FlowStep';

import Line from '@/components/line/Line';

export const calcFollowingColumnGroups = ({
  flowWithData,
  iflowStep,
}: {
  flowWithData: FlowWithData,
  iflowStep: number
}) => Array.from(
  new Map(
    flowWithData
      ?.flowSteps
      .filter((_, iflowStep_) => iflowStep_ > iflowStep)
      .flatMap(flowStep => 
        flowStep.columnGroups
      )
      .map(cgs => [cgs.id, cgs])
  )
  .entries()
  .map(([_,v]) => v)
);

type TablesProps = {
  projectId: string;
  flowId: Flow['id'];
  className?: string;
}

const Tables = ({
  projectId,
  flowId,
  className,
}: TablesProps) => {

  const [mounted, setMounted] = React.useState<boolean>(false);
  const [connections, setConnections] = React.useState<Connection[]>([]);
  const [updateLineCount, setUpdateLineCount] = React.useState<number>(0);

  const { flowWithData, invalidate, update } = useTables({
    projectId, flowId
  });

  // TODO データの追加・削除の度に
  // データの取得し直しをしているので効率が悪い
  const updateLine = async () => {
    setUpdateLineCount(prev => prev + 1);
    await invalidate();
  }
  const allData = flowWithData
    ?.flowSteps
    .flatMap(flowStep => 
      flowStep.columnGroups.flatMap(columnGroup => columnGroup.data)
    ) ?? [];

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

  const handleUpdateSteps = async ({
    newFlowStep,
    iflowStep,
  }: {
    newFlowStep: FlowStepType;
    iflowStep: number;
  }) => {
    await update({ 
      ...flowWithData, 
      flowSteps:
        flowWithData.flowSteps.map((flowStep, iflowStep_) =>
          iflowStep === iflowStep_
          ? newFlowStep
          : flowStep
        ),
    })
  };


  return (
    <div
      id='tables-container'
      className={clsx(
        'flex flex-row gap-8',
        'relative',
        className,
      )}
    >
      {/* flowのstep毎に横向きに表示する部分 */}
      {flowWithData.flowSteps.map((flowStep, iflowStep) =>
        <div key={iflowStep} className='flex flex-col gap-8'>
          {/* 同じstepに属するcolumnGroupを縦に重ねて表示する部分 */}
          <FlowStep
            className='last:mr-8'
            flowStep={flowStep}
            iflowStep={iflowStep}
            projectId={projectId}
            updateFlowStep={async (newFlowStep) => 
              await handleUpdateSteps({ newFlowStep, iflowStep })
            }
            followingColumnGroups={calcFollowingColumnGroups({
              flowWithData,
              iflowStep,
            })}
            updateLine={updateLine}
          />
        </div>
      )}
      {connections.map((c,ic) =>
        <Line key={ic} position={c} />
      )}
    </div>
  );
};

export default Tables;

