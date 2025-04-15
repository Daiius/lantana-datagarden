import clsx from 'clsx';

import Header from '@/components/header/Header';
import MeasurementColumnGroups from '@/components/measurements/MeasurementColumnGroups';

export default async function MeasurementsColumnsPage({
  params
}: { params: Promise<{ projectId: string }> }) {

  const { projectId } = await params;

  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId} />
      <div className={clsx('h-[calc(100vh-4rem)] overflow-auto')}>
        <MeasurementColumnGroups projectId={projectId} />
      </div>
    </div>
  );
}

