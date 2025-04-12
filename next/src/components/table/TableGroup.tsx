
import clsx from 'clsx';

import { 
  ColumnGroup,
  Column,
  Grouping,
  Data,
} from '@/types';

import Button from '@/components/common/Button';
import TableGroupSelector from '@/components/table/TableGroupSelector';
import Table from '@/components/table/Table';


type TableGroupProps = {
  /**
   * flowStepのインデックス
   * 最初のflowStepかどうかで一部の表示/非表示を切り替えるため使用します
   */
  istep: number;
  projectId: string;
  columns: Column[];
  dataList: Data[];
  add: (args: Omit<Data, 'id'>) => Promise<void>;
  followingColumnGroups: ColumnGroup[];
  grouping: Grouping;
  updateGrouping: (newGrouping: Grouping) => void;
  updateLine: () => void;
  /**
   * 複数columnGroupがマージされたテーブルならtrue
   * 「同じ親のデータ追加」ボタンはmergedの場合どのcolumnGroupに
   * 属するデータを追加するべきか判断できないので非表示にします
   */
  isMerged: boolean;

  className?: string;
}

const TableGroup = ({
  istep,
  projectId,
  columns,
  dataList,
  add,
  followingColumnGroups,
  grouping,
  updateGrouping,
  updateLine,
  isMerged,
  className,
}: TableGroupProps) => {

  if (columns == null || dataList == null) {
    return <div className='skeleton w-full h-32' />
  };

  const groupData = (input: Data[], grouping: Grouping): Data[][] => {
    if (!grouping) return [input];

    const map = new Map<string | number | null | undefined, Data[]>();

    for (const item of input) {
      let key: string | number | null | undefined;
      if (grouping.type === 'parent') {
        key = item.parentId;
      } else if (grouping.type === 'column') {
        key = item.data[grouping.columnName];
      } else {
        key = 'default'; // 通常到達しない...?
      }
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(item);
    }
    return Array.from(map.values());
  };

  const groupedDataList = groupData(dataList, grouping);

  const isShowingAddDataButton = 
    // マージされたテーブルであれば絶対に表示しない
    !isMerged 
    && (
       // 最初のステップなら必ず表示す 
       // (恐らくルートデータなので...)      
       istep === 0  
       // 親でグループ化されていたら
       // テーブル内で親が共通なので
       // データを追加出来る
    || grouping?.type === 'parent' 
  );

  const handleAddData = async ({ 
    data, 
    columns,
  }: {
    data: Data[];
    columns: Column[];
  }) => {
    await add({
      projectId,
      columnGroupId: columns[0]?.columnGroupId ?? 0,
      parentId: 
        grouping?.type === 'parent' 
        ? data[0]?.parentId ?? null 
        : null,
      // TODO データ追加について要件等、undefinedデータは-表示される
      data: {},
    });
    console.log(`handleAddData called!`);
  };
                 
  return (
    <div>
      <TableGroupSelector 
        columnNames={columns.map(c => c.name)}
        selected={grouping}
        setSelected={async newSelected => {
          console.log(newSelected);
          updateGrouping(newSelected);
        }}
      />
      {/* tableの表示、ここをグループ分けしたい */}
      {groupedDataList.map((data, idata) =>
        <div key={idata} className='w-fit mb-4'>
          <Table 
            className={clsx(className)}
            key={idata}
            columns={columns}
            data={data}
            addData={add}
            updateLine={updateLine}
            followingColumnGroups={followingColumnGroups}
          />
          {isShowingAddDataButton
           && columns.length > 0
           &&
            <Button 
              className={clsx(
                'btn-block btn-success',
                // 最初でないステップのデータ追加ボタンは
                // btn-soft スタイルにする
                istep !== 0 
                && isShowingAddDataButton 
                && 'btn-soft'
              )}
              onClick={async () => 
                await handleAddData({ data, columns })
              }
            >
              {grouping?.type === 'parent'
                 ? `同じ親のデータ追加`
                 : `データ追加`
              }
            </Button>
          }
        </div>
      )}
    </div>
  );
};

export default TableGroup;

