import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';

export default async function Page() {
  const zeroId = '00000000-0000-0000-0000-000000000000' as const;
  
  return (
    <div
      className={clsx()}
    >
      <Header />
      <div className='flex flex-col items-center'>
        <article className='prose lg:prose-xl p-4'>
          <h1>About</h1>
          <p>
            <span className='font-bold'>Lantana datagarden</span> is an universal scientific & technological
            data storage interface.
          </p>
          <p>
            In most practical situations, data is related to 
            other one in several ways... e.g. co-existing, 
            linking, branching, and referencing.
          </p>
          <p>
            Handling these relations properly is not an easy task, 
            not an easy software.
          </p>
          <p className='font-bold italic text-lg'>
            "How can we handle scientific & technological data for better performance?"
          </p>
          
          <h2>Software Design</h2>
          <p>
            <span className='font-bold'>Lantana datagarden</span>
            is designed to be as on-premise service.
          </p>
          <p>
            In most cases, scientific & technological data should be
            handled carefully, since they are valuable, 
            so secret information....
          </p>

          <h2>How it works</h2>
          <h3>Data</h3>
          <p>
            Data is a set of number, string, etc. 
            related with columns.
          </p>
        </article>
      </div>
    </div>
  );
}

