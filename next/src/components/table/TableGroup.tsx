
import clsx from 'clsx';

import { 
  ColumnGroup,
  Column,
  Grouping,
  Data,
} from '@/types';

import { useColumns } from '@/hooks/useColumns';
import { useDataList } from '@/hooks/useDataList';

import Button from '@/components/common/Button';
import TableGroupSelector from '@/components/table/TableGroupSelector';
import Table from '@/components/table/Table';

type ColumnGroupWithColumns = ColumnGroup & {
  columns: Column[]
};

type TableGroupProps = {
  istep: number;
  columnGroup: ColumnGroupWithColumns;
  followingColumnGroups: ColumnGroup[];
  grouping: Grouping;
  updateGrouping: (newGrouping: Grouping) => void;
  updateLine: () => void;
}

const TableGroup = ({
  istep,
  columnGroup,
  followingColumnGroups,
  grouping,
  updateGrouping,
  updateLine,
}: TableGroupProps) => {

  const { projectId, id: columnGroupId } = columnGroup;

  const { columns } = useColumns({
    projectId, columnGroupId
  });
  const { dataList, add } = useDataList({
    projectId,
    columnGroupId,
  });

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
  console.log('groupedDataList: ', groupedDataList);


  return (
    <>
      <TableGroupSelector 
        columnNames={columnGroup.columns.map(c => c.name)}
        selected={grouping}
        setSelected={async newSelected => {
          console.log(newSelected);
          updateGrouping(newSelected);
        }}
      />
      {/* tableの表示、ここをグループ分けしたい */}
      {groupedDataList.map((data, idata) =>
        <Table 
          key={idata}
          className={clsx(istep !== 0 && 'mb-4')}
          columns={columns}
          data={data}
          addData={add}
          updateLine={updateLine}
          followingColumnGroups={followingColumnGroups}
        />
      )}
      {istep === 0 &&
        <Button 
          className='btn-success btn-block'
          onClick={async () => await add({
            projectId, columnGroupId,
            parentId: null,
            data: {}
          })}
        >
          データ追加
        </Button>
      }
    </>
  );
};

export default TableGroup;

