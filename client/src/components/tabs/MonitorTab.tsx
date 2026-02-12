import React from 'react';
import { useQuery } from 'react-query';
import { BarChart3, Package, PlayCircle, CheckCircle } from 'lucide-react';
import { moApi } from '../../services/api';
import { ManufacturingOrder } from '../../types';
import Table from '../ui/Table';
import Badge from '../ui/Badge';

const MonitorTab: React.FC = () => {
  const { data: moList = [], isLoading } = useQuery(
    'manufacturing-orders',
    () => moApi.getAll()
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Draft':
        return <Badge variant="default">{status}</Badge>;
      case 'In Progress':
        return <Badge variant="warning">{status}</Badge>;
      case 'Completed':
        return <Badge variant="success">{status}</Badge>;
      case 'Cancelled':
        return <Badge variant="danger">{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  const columns = [
    {
      key: 'mo_code',
      title: 'Kode MO',
      render: (value: string) => <span className="font-semibold">{value}</span>,
    },
    {
      key: 'sku_name',
      title: 'Produk',
    },
    {
      key: 'planned_qty',
      title: 'Target',
      render: (value: number, record: ManufacturingOrder) => (
        <span>{value} {record.uom_code}</span>
      ),
    },
    {
      key: 'produced_qty',
      title: 'Aktual',
      render: (value: number, record: ManufacturingOrder) => (
        <span>{value} {record.uom_code}</span>
      ),
    },
    {
      key: 'mo_status',
      title: 'Status',
      render: (value: string) => getStatusBadge(value),
    },
  ];

  const stats = {
    total: moList.length,
    inProgress: moList.filter((mo: ManufacturingOrder) => mo.mo_status === 'In Progress').length,
    completed: moList.filter((mo: ManufacturingOrder) => mo.mo_status === 'Completed').length,
    draft: moList.filter((mo: ManufacturingOrder) => mo.mo_status === 'Draft').length,
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <BarChart3 className="w-6 h-6 text-primary-600" />
        Monitor Produksi Real-time
      </h2>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-primary-100 rounded-lg">
                <Package className="w-6 h-6 text-primary-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total MO</p>
                <p className="text-2xl font-bold text-primary-600">{stats.total}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-warning-100 rounded-lg">
                <PlayCircle className="w-6 h-6 text-warning-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Sedang Produksi</p>
                <p className="text-2xl font-bold text-warning-600">{stats.inProgress}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-success-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Selesai</p>
                <p className="text-2xl font-bold text-success-600">{stats.completed}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-content">
            <div className="flex items-center">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Package className="w-6 h-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Manufacturing Orders Table */}
      <Table
        columns={columns}
        data={moList}
        loading={isLoading}
        emptyText="Belum ada Manufacturing Order"
      />
    </div>
  );
};

export default MonitorTab;


