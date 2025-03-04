import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';

export default async function ProjectPage(
  { params }: {
    params: Promise<{ projectId: string }>
  }
) {
  const { projectId } = await params;

  return (
    <div>
      <Header className='h-[4rem]' projectId={projectId}/>
      <div className='h-[calc(100vh-4rem)] overflow-auto'>
        <p>
          TODO: This is a dashboard of the project...
        </p>
      </div>
    </div>
  );
}

