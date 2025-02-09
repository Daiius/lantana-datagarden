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
  const { data: projectName } = trpc.projectTitle.useQuery({ 
    projectId: zeroId 
  });
  console.log('projectName: ', projectName);

  const [valuePrivate, setValuePrivate] = 
    React.useState<string>(projectName);
  console.log('valuePrivate: ', valuePrivate);

  const mutation = trpc.updateProjectTitle.useMutation();
  trpc.onUpdateProjectTitle.useSubscription(
    { projectId: zeroId }, {
      onData: (data) => {
        console.log(data);
        setValuePrivate(data.newTitle);
      },
      onError: err => console.log(err),
    }
  );
  const debouncedOnChange = useDebouncedCallback(
    async (newValue: string) => {
      await mutation.mutateAsync({ 
        projectId: zeroId, newTitle: newValue 
      });
    },
    1_000
  );

  // 他の人の更新が有った場合にはその内容を反映する
  React.useEffect(() => {
    if (valuePrivate != projectName) {
      setValuePrivate(projectName);
    }
  }, [projectName]);

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
