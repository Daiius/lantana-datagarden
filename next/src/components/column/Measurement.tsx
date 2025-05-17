
import type { 
  ColumnGroupMeasurement,
  MeasurementColumnGroup,
} from '@/types';
import {
  MeasurementVisuals,
} from '@/types';
import Button from '@/components/common/Button';

import {
  IconTrash,
} from '@tabler/icons-react';

export type MeasurementProps = {
  columnGroupMeasurement: ColumnGroupMeasurement;
  measurementColumnGroup: MeasurementColumnGroup;
  update: (newValue: ColumnGroupMeasurement) => Promise<void>;
  remove: (ids: Pick<ColumnGroupMeasurement, 'projectId'|'columnGroupId'|'id'>) => Promise<void>;
};

export const Measurement = ({
  columnGroupMeasurement,
  measurementColumnGroup,
  update,
  remove,
}: MeasurementProps) => (
  <div className='flex flex-row gap-4'>
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
    <Button 
      className='text-error'
      onClick={async () => await remove(columnGroupMeasurement)}
    >
      <IconTrash />
    </Button>
  </div>
);

