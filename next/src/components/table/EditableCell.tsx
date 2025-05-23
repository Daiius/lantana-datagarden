import React from 'react';
import clsx from 'clsx';

import {
  ColumnDef
} from '@tanstack/react-table';
import type { JsonData } from '@/types';

import { trpc } from '@/providers/TrpcProvider';

import DebouncedInput from '@/components/common/DebouncedInput';

const EditableCell: Partial<ColumnDef<JsonData>> = {
  cell: ({ getValue, row, column, table }) => {
  },
};

export default EditableCell;

