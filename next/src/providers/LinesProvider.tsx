'use client' // for hooks

import { log } from '@/debug';

import { 
  useState,
  useContext,
  createContext,
  ReactNode,
} from 'react';

export type Point = {
  x: number;
  y: number;
}

export type Connection = {
  start: Point;
  end: Point;
}

export type Relation = {
  id: number;
  parentId: number;
}

export type LinesContextType = {
  //connetions: Connection[];
  register: (newRelations: Relation[]) => void;
  unregister: (relations: Relation[]) => void;
  relations: Relation[];
  //clear: () => void;
}

const LinesContext = createContext<LinesContextType | undefined>(undefined);

/**
 * LinesProvider に定義された linesContext を使用します
 * id, parentId の組を登録し、座標位置を得ます
 *
 * コンテキスト外で呼ばれた場合には例外を出します
 */
export const useLines = 
  () => useContext(LinesContext)
  ?? (() => { 
    throw new Error('cannot call useLines() outiside of the context');
  })();

export type LinesProviderProps = {
  children: ReactNode;
};

const compareRelations = (a: Relation, b: Relation) =>
a.id === b.id && a.parentId === b.parentId;

/**
 * コンポーネント階層の一番下で描画される Data の親子関係を登録し、
 * それらの間に線を描画するために使用します
 * TODO まだ実験段階で、データ更新時の振る舞いを確認中です
 */
export const LinesProvider = ({
  children,
}: LinesProviderProps) => {
  const [relations, setRelations] = useState<Relation[]>([]);
  const register = (newRelations: Relation[]) => {
    log(`LinesProvider:registerd %o`, newRelations);
    setRelations(prev => {
      const relationsToAdd = newRelations
        .filter(a => !prev.some(b => compareRelations(a, b)));
      return [...prev, ...relationsToAdd]
    });
  };
  const unregister = (oldRelations: Relation[]) => {
    log(`LinesProvider:unregistered %o`, relations);
    setRelations(prev => prev.filter(a => !oldRelations.some(b => compareRelations(a, b))));
  };

  log('LinesProvider:relations: %o', relations);

  return (
    <LinesContext.Provider 
      value={{
        register,
        unregister,
        relations,
      }}
    >
      {children}
    </LinesContext.Provider>
  );
}

