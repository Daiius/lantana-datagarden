'use client' // for hooks

//import clsx from 'clsx';

import { MeasurementVisuals } from '@/types';

import { useColumnGroupMeasurements } from '@/hooks/useColumnGroupMeasurements';
import { useColumnGroupMeasurementMutations } from '@/hooks/useColumnGroupMeasurementMutations';
import { AddMeasurementDropdown } from '@/components/column/AddMeasurementDropdown';


export type  MeasurementsProps = {
  projectId: string;
  columnGroupId: number;
};

export const Measurements = ({
  projectId,
  columnGroupId
}: MeasurementsProps) => {

  const { data: measurements } = useColumnGroupMeasurements({
    projectId, columnGroupId
  });
  const { update } = useColumnGroupMeasurementMutations();

  return (
    <>
      {measurements?.map(measurement =>
        <div 
          key={measurement.id}
          className='flex flex-row gap-4'
        >
          <div>
            {measurement.measurements.name}
          </div>
          <fieldset className='fieldset flex flex-row gap-4'>
            {MeasurementVisuals.map(mv =>
              <div key={mv}>
                <input
                  type='radio'
                  className='radio'
                  checked={measurement.visual === mv}
                  onChange={async () => await update({
                    ...measurement, visual: mv
                  })}
                />
                <label className='fieldset-label'>
                  {mv}
                </label>
              </div>
            )}
          </fieldset>
        </div>
      )}
      <AddMeasurementDropdown
        projectId={projectId}
        columnGroupId={columnGroupId}
        nameFilter={measurements?.map(m => m.measurements.name)}
      />
    </>
  );
};

