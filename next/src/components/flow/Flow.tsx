import React from 'react';
import clsx from 'clsx';


import { IconTrash } from '@tabler/icons-react';

import Input from '@/components/common/Input';
import Button from '@/components/common/Button';

import type { Flow } from '@/types';

import type { useFlows } from '@/hooks/useFlows';


type FlowProps = 
  & { flow: Flow; }
  & Pick<ReturnType<typeof useFlows>, 'update'|'remove'>
  & { className?: string; }

const Flow = ({
  flow,
  update,
  remove,
  className,
}: FlowProps) => (
  <div 
    className={clsx(
      'bg-base-100 rounded-md',
      'p-4',
      className,
    )} 
  >
    <div className='flex flex-row'>
      <fieldset className='fieldset'>
        <label className='label'>
          フロー名：
        </label>
        <Input
          value={flow.name}
          onChange={async newValue => {
            await update({ ...flow, name: newValue as string, })
          }}
        />
      </fieldset>
      <Button 
        className='text-error ms-auto'
        onClick={async () => { await remove(flow); }}
      >
        <IconTrash />
      </Button>
    </div>
    <label className='label'>
      フローに含まれるカテゴリ：
    </label>
    {/* flowの順に横に並べる部分 */}
  </div>
);

export default Flow;

