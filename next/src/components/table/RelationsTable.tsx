import React from 'react';
import clsx from 'clsx';

import Tooltip from '@/components/common/Tooltip';

const RelationsRow: React.FC<
 { data: any }
> = ({ data }) => {

  const contents = 
    typeof data === 'object' && !Array.isArray(data)
      ? Object.keys(data)
      : data as string[];

  const isArray = Array.isArray(data);

  //console.log('data: %o', data);
  //console.log('contents: %o', contents);

  return (
    // 基本的に要素は縦に並べるが...
    <div
      className={clsx(
        'flex flex-col',
      )}
    >
      {contents.map((c, ic) =>
        <div className={clsx(
          'flex flex-row',
        )}>
          <div 
            className={clsx(
              'bg-info/40 w-32 h-auto min-h-8 p-4',
              //'border-r-2 border-r-sky-200',
              'border border-info-content border-collapse',
              'rounded-none',
              'flex flex-col',
            )}
          >
            <div
              className={clsx('flex flex-row')}
            >
              <input 
                type='text'
                className='input'
                defaultValue={c}
              />
              {isArray &&
                <button className={clsx(
                  'btn btn-xs btn-success', 
                  'mt-2'
                )}>
                  +
                </button>
              }
            </div>
            {ic === contents.length - 1 &&
              <Tooltip 
                className='mt-auto'
                tip='add data' 
                direction='bottom'
              >
                <button className={clsx(
                  'btn btn-xs btn-success w-full', 
                  'mt-2'
                )}>
                  +
                </button>
              </Tooltip>
            }
          </div>
          {!isArray && data[c] != null &&
            <RelationsRow data={data[c]} />
          }
        </div>
      )}
    </div>
  );
};


const RelationsTable: React.FC = () => {
  const data = {
    A1: { 
      B1: ['C1', 'C2', 'C3', 'C4'],
      B2: [],
      B3: ['C20', 'C21', 'C22'],
    },
    A2: [],
    A3: [],
  };
  const columnNames = [
    '列名です', '俺が列名だ', 'YOU COLUMNED'
  ];
  return (
    <div className='m-4'>
      <div className='flex flex-row'>
        {columnNames.map(cn =>
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

export default RelationsTable;

