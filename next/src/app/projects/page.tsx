import React from 'react';
import clsx from 'clsx';

import Link from 'next/link';

import Header from '@/components/header/Header';


const ProjectsPage: React.FC = async () => {

  const projects = [
    { 
      id: '00000000-0000-0000-0000-000000000000',
      name: 'テストプロジェクト',
    }
  ];

  return (
    <div>
      <Header className='h-[4rem]'/>
      <div
        className='h-[calc(100vh-4rem)] overflow-auto'
      >
        {projects.map(project =>
          <Link key={project.id} href={`/projects/${project.id}`}>
            {project.name}
          </Link>
        )}
      </div>
    </div>
  );
};

export default ProjectsPage;

