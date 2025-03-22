'use client';

import React from 'react';

import type { 
  Project,
} from '@/types';
//import Input from '@/components/common/Input';
import { useDebouncedCallback } from 'use-debounce';

import { trpc } from '@/providers/TrpcProvider';

const zeroId = "00000000-0000-0000-0000-000000000000";

const Project: React.FC<
  React.ComponentProps<'div'>
> = ({
  className,
  ...props
}) => { 
  const { data: project } = trpc.project.get.useQuery({ 
    id: zeroId 
  });

  const [valuePrivate, setValuePrivate] = 
    React.useState<string>(project?.name ?? '');

  const mutation = trpc.project.update.useMutation();
  trpc.project.onUpdate.useSubscription(
    { id: zeroId }, {
      onData: (data) => {
        setValuePrivate(data.name ?? '');
      },
      onError: err => console.log(err),
    }
  );
  const debouncedOnChange = useDebouncedCallback(
    async (newValue: string) => {
      if (project == null) return;
      await mutation.mutateAsync({ 
        ...project,
        name: newValue,
      });
    },
    1_000
  );

  // 他の人の更新が有った場合にはその内容を反映する
  React.useEffect(() => {
    if (valuePrivate != project?.name) {
      setValuePrivate(project?.name ?? '');
    }
  }, [project]);

  return (
    <div 
      className='text-lg flex flex-row'
      {...props}
    >
      <div>
        プロジェクト名：
      </div>
      <input
        value={valuePrivate}
        onChange={async e => {
          setValuePrivate(e.target.value);
          debouncedOnChange(e.target.value);
        }}
      />
    </div>
  );
};

export default Project;
