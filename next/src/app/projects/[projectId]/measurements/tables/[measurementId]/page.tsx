import clsx from 'clsx';

import Header from '@/components/header/Header';
import { MeasurementTable } from '@/components/measurements/MeasurementTable';
import { MeasurementSelectLink } from '@/components/measurements/MeasurementColumnGroupSelectLink';

export default async function MeasurementTablePage(
  { params }
  : { params: Promise<{ projectId: string, measurementId: string }> }
) {
  const { projectId, measurementId } = await params;
  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId} />
      <div className='h-[calc(100vh-4rem)] p-4'>
        <MeasurementSelectLink
          projectId={projectId}
          defaultId={Number(measurementId)}
        />
        <MeasurementTable
          projectId={projectId}
          columnGroupId={Number(measurementId)}
        />
      </div>
    </div>
  );
}

