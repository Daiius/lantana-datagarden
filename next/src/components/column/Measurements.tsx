'use client' // for hooks

//import clsx from 'clsx';


import { useColumnGroupMeasurements } from '@/hooks/useColumnGroupMeasurements';
import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';
import { AddMeasurementDropdown } from '@/components/column/AddMeasurementDropdown';
import Skeleton from '../common/Skeleton';

import { Measurement } from '@/components/column/Measurement';


import { log } from '@/debug';

export type  MeasurementsProps = {
  projectId: string;
  columnGroupId: number;
};

export const Measurements = ({
  projectId,
  columnGroupId
}: MeasurementsProps) => {

  const { 
    data: columnGroupMeasurements,
    update,
    add,
    remove,
  } = useColumnGroupMeasurements({
    projectId, 
    columnGroupId,
  });

  const {
    data: measurementColumnGroups
  } = useMeasurementColumnGroups({
    projectId
  });

  return (
    <>
      {columnGroupMeasurements?.map(columnGroupMeasurement => {
        const measurementColumnGroup = measurementColumnGroups.find(mcg =>
          mcg.id === columnGroupMeasurement.measurementColumnGroupId
        );

        if (measurementColumnGroup == null) {

          log(`cannot find MeasurementColumnGroup ${columnGroupMeasurement.measurementColumnGroupId} specified in ColumnGroupMeasurement ${columnGroupMeasurement.id}`);
          return <Skeleton />;
        }

        return (
          <Measurement 
            key={columnGroupMeasurement.id}
            columnGroupMeasurement={columnGroupMeasurement}
            measurementColumnGroup={measurementColumnGroup}
            update={update}
            remove={remove}
          />
        );
      })}
      <AddMeasurementDropdown
        projectId={projectId}
        columnGroupId={columnGroupId}
        addMeasurement={add}
        idsFilter={columnGroupMeasurements.map(cgm => cgm.measurementColumnGroupId)}
      />
    </>
  );
};

