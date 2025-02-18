'use client'

import React from 'react';
import clsx from 'clsx';

import type { Column } from '@/types';

import { trpc } from '@/providers/TrpcProvider';

import Tooltip from '@/components/common/Tooltip';

const RelationsRow: React.FC<
  React.ComponentProps<'div'>
  & { 
    data: any, 
    depth?: number,
    columns: Column[],
  }
> = ({ 
  data, 
  depth = 0,
  className,
  ...props
}) => {

  console.log('data: %o', data);

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
        className,
      )}
      {...props}
    >
      {contents.map((c, ic) =>
        <div 
          key={c}
          className={clsx(
            'flex flex-row',
          )}
        >
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
              className={clsx('flex flex-row sticky top-10')}
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
            <RelationsRow 
              data={data[c]} 
              depth={depth+1}
            />
          }
        </div>
      )}
    </div>
  );
};

export default RelationsRow;

