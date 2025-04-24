'use client'

import { trpc } from '@/providers/TrpcProvider';

export const useMeasurementColumnMutations = () => {
  const { mutateAsync: update } = 
    trpc.measurement.column.update.useMutation();
  const { mutateAsync: add } =
    trpc.measurement.column.add.useMutation();
  const { mutateAsync: remove } =
    trpc.measurement.column.remove.useMutation();

  return {
    update,
    add,
    remove,
  }
};

