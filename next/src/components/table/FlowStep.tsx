//import clsx from 'clsx';

import type {
  FlowStep as FlowStepType,
  ColumnGroup,
} from '@/types';

import MergedTable from '@/components/table/MergedTable';
import { ListedTables } from '@/components/table/ListedTables';

export type FlowStepProps = {
  projectId: string;
  flowStep: FlowStepType;
  update: (newValue: FlowStepType) => Promise<void>;
  followingColumnGroups: ColumnGroup[];

  className?: string;
}

const FlowStep = (props: FlowStepProps) => {
  if (props.flowStep.mode === 'merge') return (
    <MergedTable {...props} />
  );

  return (
    <ListedTables {...props} />
  );
};

export default FlowStep;

