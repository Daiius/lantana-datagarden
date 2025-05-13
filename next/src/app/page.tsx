import React from 'react';
import clsx from 'clsx';

import Header from '@/components/header/Header';

export default async function Page() {
  return (
    <div
      className={clsx()}
    >
      <Header className='h-[4rem]'/>
      <div className='flex flex-col items-center h-[calc(100vh-4rem)] overflow-auto scroll-auto'>
        <article className='prose lg:prose-xl p-4'>
          <h1>Lantana Datagardenについて</h1>
          <p>
            Lantana Datagardenは、分野を問わず応用可能な、科学技術データを整理するための電子実験ノートです。
          </p>
          <h2>特徴</h2>
          <p>
            複数段階に渡る条件振りや、それに関連付けられる測定値を関連付けられたデータに対して、階層や順序に相当する「フロー」の概念を用いて整理します。
          </p>
          <h2>目的</h2>
          <h3>AI/分析ソフトに対応できる記録</h3>
          <p>
            AIや各種分析ソフトにデータを与える際に都合の良いデータ形式（非正規化された一つの大きな表）と、記録と整理に都合の良いデータ形式（重複や矛盾の生じにくい正規化された表）との間を取り持ちます。
          </p>

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

