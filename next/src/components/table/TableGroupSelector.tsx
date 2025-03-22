'use client'

import React from 'react';
import clsx from 'clsx';

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
const TableGroupSelector: React.FC<
  React.ComponentProps<'div'>
  & {
    columnNames: string[];
    selected: string[];
    setSelected: (selected: string[]) => void;
  }
> = ({
  columnNames,
  selected,
  setSelected,
  className,
  ...props
}) => {

  return (
    <div 
      className={clsx(
        'collapse collapse-arrow bg-base-100 border-base-300 border',
        className,
      )}
      {...props}
    >
      <input type='checkbox' className='checkbox'/>
      <div className='collapse-title flex flex-row'>
        グループ化...
      </div>
      <div className='collapse-content flex flex-row gap-2'>
        {columnNames.map(columnName =>
          <fieldset key={columnName} className='fieldset'>
            <label className='fieldset-label'>
              <input 
                type='checkbox' 
                className='checkbox'
                checked={selected.includes(columnName)}
                onChange={async e => {
                  e.currentTarget.checked 
                  ? setSelected([...selected, columnName])
                  : setSelected(selected.filter(s => s !== columnName))
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

