export enum ORDER_STATUS {
  PENDING = '0',
  PROCESSING = '1',
  COMPLETED = '2'
}

export const ORDER_STATUS_LABELS: Record<ORDER_STATUS, string> = {
  [ORDER_STATUS.PENDING]: 'Quotation',
  [ORDER_STATUS.PROCESSING]: 'Processing',
  [ORDER_STATUS.COMPLETED]: 'Completed'
};

export enum FILTER_VALUES {
  ALL_STATUS = 'all',
  ALL_BUYERS = 'all_buyers'
}