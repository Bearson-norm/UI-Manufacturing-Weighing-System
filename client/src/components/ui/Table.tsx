import React from 'react';
import { clsx } from 'clsx';

interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface TableProps<T = any> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  emptyText?: string;
  className?: string;
  rowKey?: keyof T | ((record: T) => string | number);
  onRowClick?: (record: T, index: number) => void;
  rowClassName?: (record: T, index: number) => string;
}

const Table = <T extends Record<string, any>>({
  columns,
  data,
  loading = false,
  emptyText = 'No data available',
  className,
  rowKey = 'id',
  onRowClick,
  rowClassName,
}: TableProps<T>) => {
  const getRowKey = (record: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(record);
    }
    return record[rowKey as keyof T] || index;
  };

  const getValue = (record: T, key: string | keyof T): any => {
    if (typeof key === 'string' && key.includes('.')) {
      return key.split('.').reduce((obj, k) => obj?.[k], record);
    }
    return record[key as keyof T];
  };

  const renderCellValue = (value: any): React.ReactNode => {
    if (value === null || value === undefined) {
      return '';
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-content">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="ml-2 text-gray-500">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={clsx('card', className)}>
      <div className="overflow-x-auto">
        <table className="table">
          <thead className="table-header">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={clsx(
                    'table-head',
                    {
                      'text-left': column.align === 'left' || !column.align,
                      'text-center': column.align === 'center',
                      'text-right': column.align === 'right',
                    }
                  )}
                  style={{ width: column.width }}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="table-cell text-center py-12 text-gray-500"
                >
                  {emptyText}
                </td>
              </tr>
            ) : (
              data.map((record, index) => (
                <tr
                  key={getRowKey(record, index)}
                  className={clsx(
                    'table-row',
                    {
                      'cursor-pointer hover:bg-gray-50': onRowClick,
                    },
                    rowClassName?.(record, index)
                  )}
                  onClick={() => onRowClick?.(record, index)}
                >
                  {columns.map((column, colIndex) => (
                    <td
                      key={colIndex}
                      className={clsx(
                        'table-cell',
                        {
                          'text-left': column.align === 'left' || !column.align,
                          'text-center': column.align === 'center',
                          'text-right': column.align === 'right',
                        }
                      )}
                    >
                      {column.render
                        ? column.render(getValue(record, column.key), record, index)
                        : renderCellValue(getValue(record, column.key))}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Table;


