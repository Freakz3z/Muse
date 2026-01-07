/**
 * 阿里云表格存储类型声明
 * 用于类型检查,实际使用时需要安装 @alicloud/tablestore2020
 */

declare module '@alicloud/tablestore2020' {
  export interface TableStore {
    putRow(params: any): Promise<any>
    getRow(params: any): Promise<any>
    deleteRow(params: any): Promise<any>
    batchWriteRow(params: any): Promise<any>
    listTable(): Promise<any>
  }

  export class TableStoreClient {
    constructor(config: any)
  }

  export const TableStore: new (config: any) => TableStoreClient
}
