'use client'

import React from 'react';
import clsx from 'clsx';

import type { ColumnGroup } from '@/types';

import Button from '@/components/common/Button';
import { IconTrash } from '@tabler/icons-react';

const RowDropdown: React.FC<
  React.ComponentProps<'div'>
  & { 
    projectId: string;
    dataId: number;
    columnGroupId: number;
    followingColumnGroups: ColumnGroup[];
    removeData: () => Promise<void>;
    addData: (params: { columnGroupId: number }) => Promise<void>;
  }
> = ({
  followingColumnGroups,
  removeData,
  addData,
}) => {
  const menuRef = React.useRef<HTMLUListElement>(null);
  return (
    <div
      className='dropdown'
    >
      <div 
        tabIndex={0} 
        role='button'
        className='btn'
      >
        ...
      </div>
      <ul 
        ref={menuRef}
        tabIndex={0} 
        className='dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm'
      >
        <li className='text-base-content/50'>データ追加...</li>
        {followingColumnGroups.length === 0 &&
          <li className='text-base-content/50'>
            Flowsで次ステップを追加して下さい...
          </li>
        }
        {followingColumnGroups.map(columnGroup =>
          <li key={columnGroup.id}>
            <a
              onClick={async () => {
                await addData({ columnGroupId: columnGroup.id });
                menuRef.current?.blur();
              }}
            >
              {columnGroup.name}
            </a>
          </li>
        )}
        <div className='divider'/>
        <li>
          <a
            className='text-error flex flex-row'
            onClick={async () => await removeData()}
          >
            Delete
            <IconTrash />
          </a>
        </li>
      </ul>
    </div>
  );
};

export default RowDropdown;

