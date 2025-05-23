import React from 'react';
import clsx from 'clsx';

import { t } from 'server/trpc';
import { appRouter } from 'server/router';

import Header from '@/components/header/Header';
import FlowSelect from '@/components/flow/FlowSelect';

export default async function TablesPage(
  { params }
  : { params: Promise<{ projectId: string }> }
) {

  const { projectId } = await params;

  const createCaller = t.createCallerFactory(appRouter);
  const caller = createCaller({});

  const project = await caller.project.get({ id: projectId });
  
  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId}/>
      <div
        className={clsx(
          'h-[calc(100vh-4rem)] overflow-auto scroll-m-4',
        )}
      >
        <div 
          className={clsx(
            'w-fit h-full',
            'bg-gradient-to-r from-neutral from-20% via-base-300 to-base-300',
          )}
        >
          <FlowSelect
            projectId={projectId}
          />
        </div>
      </div>
    </div>
  );
}

