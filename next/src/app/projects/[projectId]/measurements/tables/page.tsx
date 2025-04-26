import clsx from 'clsx';

import { t } from 'server/trpc';
import { appRouter } from 'server/router';

import Header from '@/components/header/Header';
import { MeasurementSelectLink } from '@/components/measurements/MeasurementColumnGroupSelectLink';

export default async function MeasurementTablesPage(
  { params }
  : { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller({});

  const project = await caller.project.get({ id: projectId });

  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId} />
      <div className='h-[calc(100vh-4rem)]'>
        <MeasurementSelectLink projectId={projectId} />
      </div>
    </div>
  );
}

