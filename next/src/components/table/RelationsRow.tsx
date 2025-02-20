'use client'

import React from 'react';
import clsx from 'clsx';

import type { Column } from '@/types';

import { trpc } from '@/providers/TrpcProvider';

import Tooltip from '@/components/common/Tooltip';
import SplitAddDataButton from './SplitAddDataButton';

type Data = {
  id: string;
  data: Record<string, string | number>,
  children?: Data[],
}

const AddDataButton: React.FC<
  React.ComponentProps<'div'>
  & { columns: string[] }
> = ({
  columns,
  className,
  ...props
}) => (
  columns.length > 1
  ? <SplitAddDataButton columns={columns} />
  : <button className='btn btn-success btn-sm !font-bold !text-2xl'>
      +
    </button>
);

const RelationsCell: React.FC<
  React.ComponentProps<'div'>
  & { value: string | number; }
> = ({
  value,
  children,
  ...props
}) => (
  // 表のセルに当たる要素
  <div 
    className={clsx(
      'bg-info/40 w-32 h-auto min-h-8 p-4',
      'border border-info-content border-collapse',
      'rounded-none',
      'flex flex-col',
    )}
    {...props}
  >
    {/* セル内の入力欄部分 */}
    <input 
      type='text'
      className='input'
      defaultValue={value}
    />
  </div>
);


const RelationsRow: React.FC<
  React.ComponentProps<'div'>
  & { 
    data: Data[];
    columns: Column[];
  }
> = ({ 
  data,
  columns,
  className,
  ...props
}) => {

  const orderMap = new Map(
    columns.map((c, icolumn) => [c.name, icolumn])
  );

  return (
    // data配列要素を縦に並べる部分
    <div
      className={clsx(
        'flex flex-col w-fit',
        className,
      )}
      {...props}
    >
      {data.map((d, index) =>
        // 最後のデータの後に"追加"ボタンを
        // 適切なサイズで設置するためのdiv要素
        <div key={d.id} className='flex flex-col w-fit'>
          {/* 
            * 複数列を持つデータを横に並べる部分 
            * 兼、children要素を更に横に表示する部分
            */}
          <div 
            className={clsx('flex flex-row w-fit')}
          >
            {Object.entries(d.data)
              .sort(([ka, _va], [kb, _vb]) => 
                  (orderMap.get(ka) ?? Infinity)
                - (orderMap.get(kb) ?? Infinity)
              ).map(([k,v], iv) =>
                <RelationsCell key={k} value={v} /> 
              )
            }
            {/* 上記で表示された列の右側、子要素表示部分 */}
            <div className='flex flex-col'>
              {d.children && 
                <RelationsRow
                  data={d.children}
                  columns={columns}
                /> 
              }
            </div>
          </div>
          {/* 追加ボタンを表示する */}
          {index === data.length - 1 &&
            <AddDataButton 
              columns={Object.values(d.data) as string[]}
            />
          }
        </div>
      )}
    </div>
  );
};

export default RelationsRow;

