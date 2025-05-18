'use client' // for hooks

import type {
  ColumnGroup,
  FlowStepColumnGroup,
  MeasurementColumn,
} from '@/types';

import TableGroup from '@/components/table/TableGroup';

import { useData } from '@/hooks/useData';

import { useColumns } from '@/hooks/useColumns';

import { log } from '@/debug';
import { useColumnGroupMeasurements } from '@/hooks/useColumnGroupMeasurements';
import { useMeasurementColumns } from '@/hooks/useMeasurementColumns';
import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';

type ListedTableProps = {
  projectId: string;
  columnGroup: ColumnGroup;
  flowStepColumnGroup: FlowStepColumnGroup;
  update: (newFlowStepColumnGroup: FlowStepColumnGroup) => Promise<void>;
  followingColumnGroups: ColumnGroup[];

  className?: string;
};

export const ListedTable = ({
  projectId,
  columnGroup,
  flowStepColumnGroup,
  followingColumnGroups,
  update,
  className,
}: ListedTableProps) => {

  log('ListedTable: rendered');

  const { id: columnGroupId } = columnGroup;
  const { data: columns } = useColumns({ projectId, columnGroupId });
  const {
    data,
    add,
    update: updateData,
    remove: removeData,
  } = useData({ projectId, columnGroupId });
  const { data: columnGroupMeasurements } = useColumnGroupMeasurements({
    projectId, columnGroupId,
  });
  const { 
    data: measurementColumnGroups,
  } = useMeasurementColumnGroups({ projectId });
  const { data: measurementColumns } = useMeasurementColumns({
    projectId, 
    // ?? columnGroupMeasurementsが決まるまではfetchできない？
    columnGroupId: 
      columnGroupMeasurements?.map(cgm => cgm.measurementColumnGroupId),
  });
  log('measurementColumns: %o', measurementColumns);


  if (
       columns == null 
    || data == null 
    || columnGroupMeasurements == null
    || measurementColumnGroups == null
    || measurementColumns == null
  ) return (
    <div className='skeleteon w-full h-32' />
  );

  let groupedMeasurementColumns: {
    [key: string]: MeasurementColumn[]
  } = {};
  for (const mc of measurementColumns) {
    const measurementColumnGroup = measurementColumnGroups
      .find(mcg => mcg.id === mc.columnGroupId);
    if (measurementColumnGroup == null) {
      log(`failed to find MeasurementColumnGroup ${mc.columnGroupId}`);
      break;
    }
    const key = measurementColumnGroup.name;
    if (groupedMeasurementColumns[key] == null) {
      groupedMeasurementColumns[key] = [];
    }
    groupedMeasurementColumns[key].push(mc);
  }
  log('groupedMeasurementColumns: %o', groupedMeasurementColumns);

  return (
    <>
      {/* columnGroup名の表示 */}
      <div className='font-bold text-lg'>
        {columnGroup.name}
      </div>
      <TableGroup
        className={className}
        projectId={projectId}
        grouping={flowStepColumnGroup.grouping}
        columns={columns}
        measurementColumns={measurementColumns}
        dataList={data}
        add={add}
        update={updateData}
        remove={removeData}
        updateGrouping={ async newGrouping => await update({ 
          ...flowStepColumnGroup, grouping: newGrouping
        })}
        followingColumnGroups={followingColumnGroups}
        isMerged={false}
      />
    </>
  );
};
