'use client' // for event handler

import type {
  MeasurementColumnGroup
} from '@/types';

import { useRouter } from 'next/navigation';

import { MeasurementSelect } from '@/components/measurements/MeasurementColumnGroupSelect';

export type MeasurementColumnGroupSelectLinkProps = {
  projectId: string;
  defaultId?: number;
}

export const MeasurementSelectLink = ({
  projectId,
  defaultId,
}: MeasurementColumnGroupSelectLinkProps) => {

  const router = useRouter();

  const handleOnChange = (v: MeasurementColumnGroup) => {
    router.push(
      `/projects/${projectId}/measurements/tables/${v.id}`
    );
  };

  return (
    <MeasurementSelect
      projectId={projectId}
      defaultId={defaultId}
      onChange={handleOnChange}
    />
  );
};

