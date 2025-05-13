import clsx from 'clsx';

import Header from '@/components/header/Header';

export default async function DocumentsFlowsPage() {
  return (
    <div>
      <Header className='h-[4rem]'/>
      <div className='flex flex-col items-center h-[calc(100vh-4rem)] overflow-hidden scroll-auto'>
        <article className='prose lg:prose-xl p-4'>
          <h1>Dataについて</h1>
          <p>
            本アプリケーションでデータを記録する際には、
          </p>
          <h1>Flowについて</h1>
          <p>
            Flowは記録するデータの時系列・順序・階層を、データ記録時に有用な方法で並べたものです。
          </p>
          <p>
            Flowは
          </p>
          <h2>例</h2>
        </article>
      </div>
    </div>
  );
}

