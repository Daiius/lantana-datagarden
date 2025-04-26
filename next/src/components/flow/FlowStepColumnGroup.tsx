
import clsx from 'clsx';

import type {
  FlowStepColumnGroup as FlowStepColumnGroupType
} from '@/types';

import type {
  useFlowStepColumnGroups
} from '@/hooks/useFlowStepColumnGroups';

import Button from '@/components/common/Button';
import {
  IconTrash
} from '@tabler/icons-react';
import ColumnGroupSelect from '@/components/column/ColumnGroupSelect';

export type FlowStepColumnGroupProps = 
  & { flowStepColumnGroup: FlowStepColumnGroupType; } 
  & Pick<ReturnType<typeof useFlowStepColumnGroups>, 'update'|'remove'>
  & { 
    deletable?: boolean;
    
    className?: string; 
  };

export const FlowStepColumnGroup = ({
  flowStepColumnGroup,
  update,
  remove,
  deletable = true,

  className,
}: FlowStepColumnGroupProps) => (
  <div 
    className={clsx(
      'flex flex-row',
      className,
    )}
    key={flowStepColumnGroup.id} 
  >
    <ColumnGroupSelect
      className='flex flex-row w-fit'
      projectId={flowStepColumnGroup.projectId}
      onChange={async newValue => await update({ 
        ...flowStepColumnGroup, columnGroupId: newValue
      })}
      value={flowStepColumnGroup.columnGroupId}
    />
    {deletable &&
      <Button 
        className='text-error'
        onClick={async () => await remove(flowStepColumnGroup)}
      >
        <IconTrash />
      </Button>
    }
  </div>
)

