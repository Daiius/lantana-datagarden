import React from 'react';
import clsx from 'clsx';

import { trpc } from '@/providers/TrpcProvider';
import type { 
  Data, 
  Column,
} from '@/types';
import DebouncedInput from '@/components/common/DebouncedInput';

/**
 * 表のセルに当たる要素
 *
 * 枠+背景部分のみのコンポーネントで、
 * 入力部分はchildrenとして外部から与えます
 */
const RelationsCell: React.FC<
  React.ComponentProps<'div'>
> = ({
  children,
  ...props
}) => (
  <div 
    className={clsx(
      'bg-info/40 w-32 h-auto min-h-8 p-4',
      'border border-info-content border-collapse',
      'rounded-none',
      'flex flex-col',
    )}
    {...props}
  >
    {children}
  </div>
);

/**
 * JsonDataを表示するセルで、
 * 含まれるキーの数だけ列幅をとります
 * 列の表示順はorderMapで指定します
 *
 * TODO
 * validationのためcolumn情報を受け取る必要あり
 *
 * JsonDataは基本的には列毎に個別に更新せず、毎回全体を書き戻します
 * （列間の値に組み合わせの制限がある場合等に対応するため）
 * そのため、変更用の関数はRelationsCellsが受け持ちます
 */
const RelationsCells: React.FC<
  React.ComponentProps<'div'>
  & { 
    data: Data;
    orderMap: Map<string, number>;
    columns: Column[];
  }
> = ({ 
  data: initialData,
  columns,
  orderMap,
  className,
  children,
  ...props
}) => {
  const { mutateAsync } = trpc.data.update.useMutation();
  const utils = trpc.useUtils();
  const { id, projectId, columnGroupId } = initialData;
  const { data: queriedData } = trpc.data.get.useQuery(
    { id, projectId, columnGroupId },
    { enabled: false, initialData },
  );

  const data = queriedData ? queriedData : initialData;

  trpc.data.onUpdate.useSubscription(
    { id, projectId, columnGroupId },
    {
      onData: newData => {
        utils.data.get.setData(
          { id, projectId, columnGroupId }, 
          newData
        );
        console.log('RelationsCells, onData: %o', newData);
      }
    },
  );

  console.log(
    `RelationsCells (id:${data.id}) rendered at ${new Date()}`
  );

  return (
    <div 
      className={clsx('flex flex-row w-fit')}
      {...props}
    >
      {Object.entries(data.data)
        .sort(([ka, _va], [kb, _vb]) => 
            (orderMap.get(ka) ?? Infinity)
          - (orderMap.get(kb) ?? Infinity)
        ).map(([k,v]) =>
          <RelationsCell key={k}> 
            {/* セル内の入力欄部分 */}
            <DebouncedInput
              value={v}
              validation={
                columns.find(c => c.name === k)?.type ?? 'string'
              }
              debouncedOnChange={async newValue => {
                const newData = { 
                  ...data, 
                  data: { ...data.data, [k]: newValue }
                }; 
                //console.log(newData);
                await mutateAsync(newData);
              }}
            />
          </RelationsCell>
        )
      }
    </div>
  );
}

export default RelationsCells;

