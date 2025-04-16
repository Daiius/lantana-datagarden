'use client'
import { trpc } from '@/providers/TrpcProvider';

export const useMeasurementMutations = () => {
  const { mutateAsync: update } =
    trpc.measurement.data.update.useMutation();
  const { mutateAsync: add } =
    trpc.measurement.data.add.useMutation();
  const { mutateAsync: remove } =
    trpc.measurement.data.remove.useMutation();

  return {
    update,
    add,
    remove
  };
};

