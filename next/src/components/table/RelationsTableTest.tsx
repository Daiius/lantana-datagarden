import React from 'react';
import clsx from 'clsx';

import Tooltip from '@/components/common/Tooltip';
import SplitAddDataButton from './SplitAddDataButton';

type Data = {
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
  & { data: Data[] }
> = ({ 
  data,
  className,
  ...props
}) => {

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
        <div className='flex flex-col w-fit'>
          {/* 
            * 複数列を持つデータを横に並べる部分 
            * 兼、children要素を更に横に表示する部分
            */}
          <div 
            className={clsx('flex flex-row w-fit')}
          >
            {Object.values(d.data).map((v, iv) =>
              <RelationsCell value={v} /> 
            )}
            {/* 上記で表示された列の右側、子要素表示部分 */}
            <div className='flex flex-col'>
              {d.children && <RelationsRow data={d.children} /> }
            </div>
          </div>
          {/* 追加ボタンを表示する */}
          {index === data.length - 1 &&
            <AddDataButton columns={Object.values(d.data) as string[]}/>
          }
        </div>
      )}
    </div>
  );
};


const RelationsTableTest: React.FC<
  React.ComponentProps<'div'>
> = ({
  className,
  ...props
}) => {


  const data: Data[] = [{
    data: {
      "列名です": "テストです",
      "俺が列名だ": "はい",
    },
    children: [{ 
      data: { 
        "YOU COLUMNED": "C1", 
        //"TEST": "TEST",
      }, 
      //children: [{ data: { "TEST": "TEST" }}],
    }, { 
      data: { "YOU COLUMNED": "C2", },
    }],
  }, {
    data: {
      "列名です": "2つめのデータです",
      "俺が列名だ": "そうですね",
    }
  }];
  const columnGroups = [
    ['列名です', '俺が列名だ'],
    ['YOU COLUMNED'],
  ];
  return (
    <div 
      className={clsx(
        'm-4',
        'overflow-auto',
        className,
      )}
      {...props}
    >
      <div className='flex flex-row'>
        {columnGroups.map(cg =>
          <div>
            {cg.map(cn =>
              <input 
                key={cn} 
                className={clsx(
                  'input input-ghost input-sm',
                  'rounded-none text-center',
                  'bg-info/50 w-32 border border-white/50',
                )}
                defaultValue={cn}
              />
            )}
          </div>
        )}
        <Tooltip tip='add column' direction='right'>
          <button 
            className={clsx(
              'btn btn-sm btn-success',
              'w-full',
            )}
          >
            +
          </button>
        </Tooltip>
      </div>
      <RelationsRow data={data} />
    </div>
  );
};

export default RelationsTableTest;

