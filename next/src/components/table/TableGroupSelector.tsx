'use client'

import React from 'react';
import clsx from 'clsx';

import type { Grouping } from '@/types';

type TableGroupingCheckboxProps = {
  option: NonNullable<Grouping>;
  selected: Grouping;
  setSelected: (value: Grouping) => Promise<void>;
}

const areGroupingsEqual = (
  a: Grouping,
  b: Grouping,
): boolean => {
  // 片方または両方がundefinedならfalse
  if (a == null || b == null) return false;

  // type === parent のときは、typeが合致すればよい
  if (a.type === 'parent' && b.type === 'parent') return true;

  // type === column のときは、columnNameまで合致する必要がある
  if (a.type === 'column' && b.type === 'column') {
    return a.columnName === b.columnName;
  }

  // type不一致の時は、他の内容に関わらずfalse
  return false;
}

const groupingToKey = (
  g: Grouping
): string => {
  if (g == null) return 'group-none';
  if (g.type === 'parent') return 'group-parent';
  if (g.type === 'column') return `group-column-${g.columnName}`;

  // TODO Groupingの型を網羅しているので、ここには到達しないはず？
  // これを担保する仕組みが有った様な...
  return 'group';
}

const TableGroupingCheckbox = ({
  option,
  selected,
  setSelected,
}: TableGroupingCheckboxProps) => {

  const checked = areGroupingsEqual(option, selected);
          
  return (
    <fieldset className='fieldset whitespace-nowrap'>
      <label className='fieldset-label'>
        <input 
          type='checkbox' 
          className='checkbox'
          checked={checked}
          onChange={async () => {
            checked
            ? await setSelected(undefined)
            : await setSelected(option)
          }}
        />
        {option.type === 'parent'
          ? '親'
          : option.type === 'column'
            ? option.columnName
            : '不明なオプション'
        }
      </label>
    </fieldset>
  );
}

type TableGroupSelectorProps = {
  columnNames: string[];
  selected: Grouping;
  setSelected: (selected: Grouping) => Promise<void>;

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

  const options: NonNullable<Grouping>[] = [
    { type: 'parent' },
    ...columnNames.map(columnName => (
      { type: 'column' as const, columnName }
    )),
  ];

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
        {options.map(option =>
          <TableGroupingCheckbox
            key={groupingToKey(option)}
            option={option}
            selected={selected}
            setSelected={setSelected}
          />
        )}
      </div>
    </div>
  );
};

export default TableGroupSelector;

