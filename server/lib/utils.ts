import { and, eq } from 'drizzle-orm';
import { MySql2Database } from 'drizzle-orm/mysql2';
import * as schema from 'database/db/schema';
import {
  measurements,
  data,
} from 'database/db/schema';

// NOTE MeasurementsとDataでColumnGroupを分けたので要変更
const moveDataToMeasurement = async ({
  tx,
  projectId,
  columnGroupId,
}: {
  tx: MySql2Database<typeof schema>;
  projectId: string;
  columnGroupId: number;
}) => {
  await tx.insert(measurements)
    .select(
      tx.select({
        id: data.id,
        columnGroupId: data.columnGroupId,
        projectId: data.projectId,
        data: data.data,
        dataId: data.parentId, 
      })
      .from(data)
      .where(
        and(
          eq(data.columnGroupId, columnGroupId),
          eq(data.projectId, projectId),
        )
      ),
    );
  await tx.delete(data)
    .where(
      and(
        eq(data.columnGroupId, columnGroupId),
        eq(data.projectId, projectId),
      )
    );
};

// NOTE MeasurementsとDataでColumnGroupを分けたので要変更
const moveMeasurementToData = async ({
  tx,
  projectId,
  columnGroupId,
}: {
  tx: MySql2Database<typeof schema>;
  projectId: string;
  columnGroupId: number;
}) => {
  await tx.insert(data)
    .select(
      tx.select({
        id: measurements.id,
        columnGroupId: measurements.columnGroupId,
        projectId: measurements.projectId,
        data: measurements.data,
        parentId: measurements.dataId, 
      })
      .from(measurements)
      .where(
        and(
          eq(measurements.columnGroupId, columnGroupId),
          eq(measurements.projectId, projectId),
        )
      ),
    );
  await tx.delete(measurements)
    .where(
      and(
        eq(measurements.columnGroupId, columnGroupId),
        eq(measurements.projectId, projectId),
      )
    );
};

