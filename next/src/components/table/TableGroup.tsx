
import TableGroupSelector from '@/components/table/TableGroupSelector';
import Table from '@/components/table/Table';

import { 
  ColumnGroup,
  Column,
  Grouping,
} from '@/types';

type ColumnGroupWithColumns = ColumnGroup & {
  columns: Column[]
};

type TableGroupProps = {
  columnGroup: ColumnGroupWithColumns;
  followingColumnGroups: ColumnGroup[];
  grouping: Grouping;
  updateGrouping: (newGrouping: Grouping) => void;
  updateLine: () => void;
}

const TableGroup = ({
  columnGroup,
  followingColumnGroups,
  grouping,
  updateGrouping,
  updateLine,
}: TableGroupProps) => {
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
      <Table 
        projectId={columnGroup.projectId}
        columnGroupId={columnGroup.id}
        updateLine={updateLine}
        followingColumnGroups={followingColumnGroups}
      />
    </>
  );
};

export default TableGroup;

