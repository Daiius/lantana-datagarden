'use client' // for hooks

//import clsx from 'clsx';

import { MeasurementVisuals } from '@/types';

import { useColumnGroupMeasurements } from '@/hooks/useColumnGroupMeasurements';
import { useMeasurementColumnGroups } from '@/hooks/useMeasurementColumnGroups';
import { AddMeasurementDropdown } from '@/components/column/AddMeasurementDropdown';
import Skeleton from '../common/Skeleton';


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
  } = useColumnGroupMeasurements({
    projectId, 
    columnGroupId,
  });

  // NOTE 注意、必要なデータ以外も取得している
  // columnGroupMeasurementに関連するmeasurementColumnGroup以外も取得している
  // subscriptionも重複して行われる
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
          return <Skeleton />
        }

        return (
          <div 
            key={columnGroupMeasurement.id}
            className='flex flex-row gap-4'
          >
            <div>
              {measurementColumnGroup.name}
            </div>
            <fieldset className='fieldset flex flex-row gap-4'>
              {MeasurementVisuals.map(mv =>
                <div key={mv}>
                  <input
                    type='radio'
                    className='radio'
                    checked={columnGroupMeasurement.visual === mv}
                    onChange={async () => await update({
                      ...columnGroupMeasurement, visual: mv
                    })}
                  />
                  <label className='fieldset-label'>
                    {mv}
                  </label>
                </div>
              )}
            </fieldset>
          </div>
        );
      })}
      {/* TODO AddMeasurementDropdown内で、ここにあるのと重複するデータ取得 
          それならばここからpropsで渡した方が良さそう
      */}
      <AddMeasurementDropdown
        projectId={projectId}
        columnGroupId={columnGroupId}
        addMeasurement={add}
        idsFilter={columnGroupMeasurements.map(cgm => cgm.measurementColumnGroupId)}
      />
    </>
  );
};

