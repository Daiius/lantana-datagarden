'use client'

import React from 'react';
import clsx from 'clsx';

type TableGroupSelectorProps = {
  columnNames: string[];
  selected: string | undefined;
  setSelected: (selected: string) => Promise<void>;

  className?: string;
}

/**
 * Tableをデータ内容にしたがってグループ化するための
 * 選択用コンポーネントです
 *
 * checkboxでどの列をグループ化対象にするかイベント処理をするため、
 * client component とします
 *
 * TODO
 * グループ化方法をDBに記録する？どうやって他の人と共有する？
 *
 */
const TableGroupSelector = ({
  columnNames,
  selected,
  setSelected,
  className,
}: TableGroupSelectorProps) => {

  return (
    <div
      className={clsx(
        'dropdown dropdown-arrow bg-base-100 border-base-300 border',
        className,
      )}
    >
      <div tabIndex={0} className='btn' role='button'>
        グループ化...
      </div>
      <div 
        className={clsx(
          'dropdown-content bg-base-100 rounded-box z-1 p-2 shadow-sm',
          'flex flex-row gap-2'
        )}
      >
        {columnNames.map(columnName =>
          <fieldset key={columnName} className='fieldset whitespace-nowrap'>
            <label className='fieldset-label'>
              <input 
                type='checkbox' 
                className='checkbox'
                checked={selected === columnName}
                onChange={async e => {
                  console.log(e.currentTarget.checked);
                  e.currentTarget.checked
                  ? await setSelected(columnName)
                  : await setSelected('')
                }}
              />
              {columnName}
            </label>
          </fieldset>
        )}
      </div>
    </div>
  );
};

export default TableGroupSelector;

