'use client' // for hooks

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

/**
 * コンポーネント階層の一番下で描画される Data の親子関係を登録し、
 * それらの間に線を描画するために使用します
 * TODO まだ実験段階で、データ更新時の振る舞いを確認中です
 */
export const LinesProvider = ({
  children,
}: LinesProviderProps) => {
  const [relations, setRelations] = useState<Relation[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const register = (newRelations: Relation[]) => {
    console.log(`registerd ${newRelations.length} relations`);
  };
  const unregister = (relations: Relation[]) => {
    console.log(`unregistered ${relations.length} relations`);
  };

  return (
    <LinesContext.Provider 
      value={{
        register,
        unregister,
      }}
    >
      {children}
    </LinesContext.Provider>
  );
}

