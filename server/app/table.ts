/*
 * Tableはデータベースに直接的に対応する概念が有りません。
 * Flow, ColumnGroup, Column, Data から構築される仮想的な概念です。
 *
 * そのため /app/table.ts を用意し、そこから/lib ディレクトリ内の
 * 各種テーブル関連の関数にアクセスしながら必要な動作を行います
 *
 * アプリケーション層とインフラストラクチャー層の分離に
 * 該当するだろうか
 *
 */

/**
 * 指定したprojectId, flowId から構成される
 * tableに必要な情報である、columnGroupsとdataを取得します
 */
export const get = async ({ 
  projectId, 
  flowId 
} : {
  projectId: string;
  flowId: number;
}) => {
};

