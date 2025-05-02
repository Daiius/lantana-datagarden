'use client'

import { useRef } from 'react';
import clsx from 'clsx';

import type { 
  Flow,
} from '@/types';


import { FlowSteps } from '@/components/table/FlowSteps';

import { LinesProvider } from '@/providers/LinesProvider';
import { Lines } from '@/components/line/Lines';

type TablesProps = {
  projectId: string;
  flowId: Flow['id'];
  className?: string;
}

/**
 * 指定されたフローによる表を表示します
 *
 * TableはDBと対応する要素はなく、
 * Flow, FlowStep, FlowStepColumnGroup, ColumnGroup, Column, Data など
 * 様々なデータを逐次取得して構成します
 */
export const Tables = ({
  projectId,
  flowId,
  className,
}: TablesProps) => {

  const refContainer = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={refContainer}
      id='tables-container'
      className={clsx(
        'flex flex-row gap-8',
        'relative',
        className,
      )}
    >
      <LinesProvider>
        <FlowSteps
          projectId={projectId}
          flowId={flowId}
        />
        <Lines container={refContainer}/>
      </LinesProvider>
    </div>
  );
};

export default Tables;

