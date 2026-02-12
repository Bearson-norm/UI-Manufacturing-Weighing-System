import React from 'react';
import { useQuery } from 'react-query';
import { FileText } from 'lucide-react';
import { consumptionApi } from '../../services/api';
import { MaterialConsumption } from '../../types';
import Table from '../ui/Table';

const HistoryTab: React.FC = () => {
  const { data: consumptionList = [], isLoading } = useQuery(
    'consumption-history',
    () => consumptionApi.getAll()
  );

  const columns = [
    {
      key: 'consumption_date',
      title: 'Tanggal',
      render: (value: string) => (
        <span>{new Date(value).toLocaleString('id-ID')}</span>
      ),
    },
    {
      key: 'mo_code',
      title: 'MO',
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'sku_name',
      title: 'Bahan Baku',
    },
    {
      key: 'consumed_qty',
      title: 'Jumlah',
      render: (value: number, record: MaterialConsumption) => (
        <span>{value} {record.uom_code}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <FileText className="w-6 h-6 text-primary-600" />
        Riwayat Konsumsi Bahan Baku
      </h2>

      <Table
        columns={columns}
        data={consumptionList}
        isLoading={isLoading}
        emptyText="Belum ada data konsumsi"
      />
    </div>
  );
};

export default HistoryTab;


