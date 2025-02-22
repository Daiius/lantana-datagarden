'use client'

import React from 'react';
import clsx from 'clsx';

import type {
  Column,
  Data,
} from '@/types';

import { trpc } from '@/providers/TrpcProvider';

import Tooltip from '@/components/common/Tooltip';
import SplitAddDataButton from './SplitAddDataButton';
import RelationsCells from '@/components/table/RelationsCells';


const AddDataButton: React.FC<
  React.ComponentProps<'div'>
  & { columns: Column[] }
> = ({
  columns,
  className,
  ...props
}) => (
  columns.length > 1
  ? <SplitAddDataButton 
      columns={columns} 
    />
  : <button 
      className='btn btn-success btn-sm !font-bold !text-2xl'
    > 
      +
    </button>
);

type DataWithChildren = Data & { children?: DataWithChildren[] };

const RelationsRow: React.FC<
  React.ComponentProps<'div'>
  & { 
    data: DataWithChildren[];
    columns: Column[];
    orderMap: Map<string, number>;
  }
> = ({ 
  data: initialData,
  columns,
  orderMap,
  className,
  ...props
}) => {

  console.log(
    `RelationsRow (ndata=${initialData.length}) is rendered`
  );

  const projectId = initialData[0]?.projectId ?? '';
  const columnGroupId = initialData[0]?.columnGroupId ?? '';

  const utils = trpc.useUtils();

  const { data } = trpc.data.list.useQuery(
    { projectId, columnGroupId },
    { enabled: false, initialData }
  );
  trpc.data.onUpdateList.useSubscription(
    { projectId, columnGroupId }, 
    {
      onData: newData => {
        // onUpdateListはchildren要素を持たない情報なので
        // propsのdata.childrenから補う
        utils.data.list.setData(
          { projectId, columnGroupId },
          newData,
        );
        console.log('RelationsRow, onData: %o', newData);
    }
  });

  const mergedData = data.map(d => {
    const relatedInitialData = 
      initialData.find(rid => rid.id === d.id);
    return { 
      ...d, 
      children: relatedInitialData?.children ?? [] 
    };
  });

  //console.log('mergedData: %o', mergedData);

  return (
    // data配列要素を縦に並べる部分
    <div
      className={clsx(
        'flex flex-col w-fit',
        className,
      )}
      {...props}
    >
      {mergedData.map((d, index) =>
        // 最後のデータの後に"追加"ボタンを
        // 適切なサイズで設置するためのdiv要素
        <div key={d.id} className='flex flex-col w-fit'>
          {/* 
            * 複数列を持つデータを横に並べる部分 
            * 兼、children要素を更に横に表示する部分
            */}
          <RelationsCells
            data={d}
            columns={columns}
            orderMap={orderMap}
          >
            {/* 上記で表示された列の右側、子要素表示部分 */}
            {d.children && 
              <div className='flex flex-col'>
                <RelationsRow
                  data={d.children}
                  columns={columns}
                  orderMap={orderMap}
                /> 
              </div>
            }
          </RelationsCells>
          {/* 追加ボタンを表示する */}
          {index === mergedData.length - 1 &&
            <AddDataButton columns={columns} />
          }
        </div>
      )}
    </div>
  );
};

export default RelationsRow;

